local isUIOpen = false

-- 打开签到界面
local function OpenDailyReward()
    if isUIOpen then return end

    -- 使用 ox_lib callback 获取玩家数据
    local data = lib.callback.await('dy_daily_reward:getData', false)
    if not data then return end

    isUIOpen = true
    SetNuiFocus(true, true)

    -- 从 Config.Rewards 中提取特殊日
    local specialDays = {}
    for day, reward in pairs(Config.Rewards) do
        if reward.special then
            table.insert(specialDays, day)
        end
    end

    -- 发送数据到前端
    SendNUIMessage({
        action = 'open',
        data = {
            rewards = Config.Rewards,
            specialDays = specialDays,
            claimedDays = data.claimedDays or {},
            currentDay = data.currentDay,
            streak = data.streak or 0,
            serverTime = data.serverTime
        }
    })
end

-- 关闭签到界面
local function CloseDailyReward()
    if not isUIOpen then return end

    isUIOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = 'close'
    })
end

-- NUI 回调：关闭界面
RegisterNUICallback('close', function(data, cb)
    CloseDailyReward()
    cb('ok')
end)

-- NUI 回调：领取奖励（使用 callback）
RegisterNUICallback('claim', function(data, cb)
    local day = data.day
    if not day then
        cb('ok')
        return
    end

    -- 使用 callback 领取奖励
    local result = lib.callback.await('dy_daily_reward:claim', false, day)

    if result.success then
        SendNUIMessage({
            action = 'claimSuccess',
            day = day
        })

        -- 显示领取成功通知
        local message = string.format(Config.Notifications.claimSuccess, day, result.reward.name, result.reward.quantity)
        lib.notify({
            title = '每日签到',
            description = message,
            type = 'success'
        })

        -- 连续签到奖励通知
        if result.streakBonus then
            local streakMsg = string.format(Config.Notifications.streakBonus, result.streak, result.streakBonus)
            lib.notify({
                title = '连续签到奖励',
                description = streakMsg,
                type = 'success'
            })
        end
    else
        SendNUIMessage({
            action = 'claimFailed'
        })

        lib.notify({
            title = '每日签到',
            description = result.reason or '领取失败',
            type = 'error'
        })
    end

    cb('ok')
end)

-- 注册命令
RegisterCommand(Config.Command, function()
    OpenDailyReward()
end, false)

-- 注册按键绑定
if Config.OpenKey then
    RegisterKeyMapping(Config.Command, '打开每日签到', 'keyboard', Config.OpenKey)
end

-- -- ESC 键关闭（备用，前端也会处理）
-- CreateThread(function()
--     while true do
--         Wait(0)
--         if isUIOpen then
--             DisableControlAction(0, 200, true) -- ESC
--             if IsDisabledControlJustReleased(0, 200) then
--                 CloseDailyReward()
--             end
--         end
--     end
-- end)
