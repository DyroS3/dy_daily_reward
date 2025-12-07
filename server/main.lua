-- ESX 框架
ESX = exports['es_extended']:getSharedObject()

-- 获取玩家 identifier
local function GetPlayerIdentifier(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer then
        return xPlayer.identifier
    end
    return nil
end

-- 获取当前日期信息
local function GetDateInfo()
    local date = os.date('*t')
    return {
        day = date.day,
        month = date.month,
        year = date.year,
        dateStr = os.date('%Y-%m-%d')
    }
end

-- 初始化玩家数据
local function InitPlayerData(identifier)
    local dateInfo = GetDateInfo()
    MySQL.insert.await('INSERT IGNORE INTO daily_rewards (identifier, current_month, current_year) VALUES (?, ?, ?)', {
        identifier, dateInfo.month, dateInfo.year
    })
end

-- 获取玩家签到数据
local function GetPlayerData(identifier)
    local dateInfo = GetDateInfo()
    local result = MySQL.single.await('SELECT * FROM daily_rewards WHERE identifier = ?', { identifier })

    if not result then
        InitPlayerData(identifier)
        return {
            claimedDays = {},
            currentDay = dateInfo.day,
            streak = 0,
            serverTime = os.time()
        }
    end

    -- 检查是否需要重置（新的月份）
    if result.current_month ~= dateInfo.month or result.current_year ~= dateInfo.year then
        MySQL.update.await('UPDATE daily_rewards SET claimed_days = ?, current_month = ?, current_year = ?, streak = 0 WHERE identifier = ?', {
            '[]', dateInfo.month, dateInfo.year, identifier
        })
        return {
            claimedDays = {},
            currentDay = dateInfo.day,
            streak = 0,
            serverTime = os.time()
        }
    end

    local claimedDays = json.decode(result.claimed_days) or {}

    return {
        claimedDays = claimedDays,
        currentDay = dateInfo.day,
        streak = result.streak or 0,
        lastClaimDate = result.last_claim_date,
        serverTime = os.time()
    }
end

-- 检查是否可以领取
local function CanClaim(playerData, day)
    local dateInfo = GetDateInfo()

    -- 检查是否已领取
    for _, claimedDay in ipairs(playerData.claimedDays) do
        if claimedDay == day then
            return false, Config.Notifications.alreadyClaimed
        end
    end

    -- 检查是否是当天或之前的天数
    if day > dateInfo.day then
        return false, Config.Notifications.notAvailable
    end

    -- 只能领取当天的奖励
    if day ~= dateInfo.day then
        return false, Config.Notifications.notAvailable
    end

    return true, nil
end

-- 发放车辆奖励
local function GiveVehicle(source, model)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return false end

    local identifier = xPlayer.identifier

    -- 生成车牌
    local plate = string.upper('DR' .. math.random(10000, 99999))

    -- 检查车牌是否已存在
    local existingPlate = MySQL.scalar.await('SELECT plate FROM owned_vehicles WHERE plate = ?', { plate })
    while existingPlate do
        plate = string.upper('DR' .. math.random(10000, 99999))
        existingPlate = MySQL.scalar.await('SELECT plate FROM owned_vehicles WHERE plate = ?', { plate })
    end

    -- 创建车辆数据
    local vehicleProps = {
        model = GetHashKey(model),
        plate = plate,
    }

    -- 插入数据库
    MySQL.insert.await('INSERT INTO owned_vehicles (owner, plate, vehicle) VALUES (?, ?, ?)', {
        identifier,
        plate,
        json.encode(vehicleProps)
    })

    return true, plate
end

-- 发放奖励
local function GiveReward(source, reward)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return false end

    if reward.type == 'money' then
        xPlayer.addMoney(reward.quantity)
    elseif reward.type == 'bank' then
        xPlayer.addAccountMoney('bank', reward.quantity)
    elseif reward.type == 'item' then
        xPlayer.addInventoryItem(reward.item, reward.quantity)
    elseif reward.type == 'weapon' then
        xPlayer.addWeapon(reward.item, 100)
    elseif reward.type == 'vehicle' then
        local success, plate = GiveVehicle(source, reward.model)
        if success then
            TriggerClientEvent('ox_lib:notify', source, {
                title = '车辆奖励',
                description = '恭喜获得载具！车牌: ' .. plate,
                type = 'success'
            })
        end
        return success
    end

    return true
end

-- 计算连续签到
local function CalculateStreak(playerData, dateInfo)
    local lastClaim = playerData.lastClaimDate
    if not lastClaim then
        return 1
    end

    -- 解析上次领取日期（处理 oxmysql 可能返回数字或字符串的情况）
    local year, month, day

    if type(lastClaim) == 'number' then
        -- oxmysql 返回的是时间戳（毫秒）
        local dateTable = os.date('*t', lastClaim / 1000)
        year, month, day = dateTable.year, dateTable.month, dateTable.day
    elseif type(lastClaim) == 'string' then
        year, month, day = lastClaim:match('(%d+)-(%d+)-(%d+)')
        year, month, day = tonumber(year), tonumber(month), tonumber(day)
    else
        return 1
    end

    if not year then return 1 end

    local lastDate = os.time({ year = year, month = month or 1, day = day or 1 })
    local today = os.time({ year = dateInfo.year, month = dateInfo.month, day = dateInfo.day })
    local diff = os.difftime(today, lastDate) / 86400

    if diff == 1 then
        return playerData.streak + 1
    elseif diff == 0 then
        return playerData.streak
    else
        return 1
    end
end

-- Callback: 获取玩家签到数据
lib.callback.register('dy_daily_reward:getData', function(source)
    local identifier = GetPlayerIdentifier(source)

    if not identifier then
        print('[dy_daily_reward] 无法获取玩家标识符: ' .. source)
        return nil
    end

    return GetPlayerData(identifier)
end)

-- Callback: 领取奖励
lib.callback.register('dy_daily_reward:claim', function(source, day)
    local identifier = GetPlayerIdentifier(source)

    if not identifier then
        return { success = false, reason = '玩家数据错误' }
    end

    local playerData = GetPlayerData(identifier)
    local canClaim, reason = CanClaim(playerData, day)

    if not canClaim then
        return { success = false, reason = reason }
    end

    local reward = Config.Rewards[day]
    if not reward then
        return { success = false, reason = '奖励配置错误' }
    end

    -- 发放奖励
    local success = GiveReward(source, reward)
    if not success then
        return { success = false, reason = '发放奖励失败' }
    end

    -- 更新数据库
    local dateInfo = GetDateInfo()
    local newStreak = CalculateStreak(playerData, dateInfo)
    table.insert(playerData.claimedDays, day)

    MySQL.update.await([[
        UPDATE daily_rewards
        SET claimed_days = ?, last_claim_date = ?, streak = ?, total_claims = total_claims + 1
        WHERE identifier = ?
    ]], {
        json.encode(playerData.claimedDays),
        dateInfo.dateStr,
        newStreak,
        identifier
    })

    -- 检查连续签到奖励
    local streakBonusAmount = nil
    local streakBonus = Config.StreakBonus[newStreak]
    if streakBonus and streakBonus.type == 'money' then
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer then
            xPlayer.addMoney(streakBonus.quantity)
            streakBonusAmount = streakBonus.quantity
        end
    end

    print(string.format('[dy_daily_reward] 玩家 %s 领取了第 %d 天奖励', identifier, day))

    return {
        success = true,
        reward = reward,
        streak = newStreak,
        streakBonus = streakBonusAmount
    }
end)

-- 资源启动时确保数据库表存在
MySQL.ready(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS `daily_rewards` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `identifier` VARCHAR(60) NOT NULL,
            `last_claim_date` DATE DEFAULT NULL,
            `claimed_days` JSON DEFAULT '[]',
            `current_month` INT DEFAULT 0,
            `current_year` INT DEFAULT 0,
            `streak` INT DEFAULT 0,
            `total_claims` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `identifier` (`identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    print('[dy_daily_reward] 数据库表已就绪')
end)
