Config = {}

-- 打开签到界面的命令
Config.Command = 'dailyreward'

-- 打开签到界面的按键 (可选，设为 nil 禁用)
Config.OpenKey = false --[[ 'F5' ]]

---@class RewardConfig
---@field name string 奖励显示名称
---@field type 'item'|'money'|'bank'|'weapon'|'vehicle' 奖励类型
---@field item? string 物品/武器名称 (type为item或weapon时必填)
---@field model? string 载具模型名 (type为vehicle时必填)
---@field quantity number 奖励数量
---@field special? boolean 是否为特殊奖励日 (金色高亮效果)
---@type table<number, RewardConfig>
Config.Rewards = {
    [1]  = { name = '金币', type = 'money', item = nil, quantity = 500 },
    [2]  = { name = '皮革', type = 'item', item = 'leather', quantity = 5 },
    [3]  = { name = '现金', type = 'money', item = nil, quantity = 500, special = true }, -- 任意天都可设为特殊日
    [4]  = { name = '绷带', type = 'item', item = 'bandage', quantity = 10 },
    [5]  = { name = '金属', type = 'item', item = 'iron', quantity = 3 },
    [6]  = { name = '水晶', type = 'item', item = 'crystal', quantity = 1 },
    [7]  = { name = '神秘宝箱', type = 'item', item = 'mysterybox', quantity = 1, special = true },
    [8]  = { name = '布料', type = 'item', item = 'cloth', quantity = 8 },
    [9]  = { name = '现金', type = 'money', item = nil, quantity = 1000 },
    [10] = { name = '医疗包', type = 'item', item = 'medkit', quantity = 3 },
    [11] = { name = '砖块', type = 'item', item = 'brick', quantity = 20 },
    [12] = { name = '塑料', type = 'item', item = 'plastic', quantity = 10 },
    [13] = { name = '三明治', type = 'item', item = 'sandwich', quantity = 5 },
    [14] = { name = '高级宝箱', type = 'item', item = 'premiumbox', quantity = 1, special = true },
    [15] = { name = '现金', type = 'money', item = nil, quantity = 2000 },
    [16] = { name = '肾上腺素', type = 'item', item = 'adrenaline', quantity = 5 },
    [17] = { name = '铁锭', type = 'item', item = 'ironingot', quantity = 15 },
    [18] = { name = '工具箱', type = 'item', item = 'toolbox', quantity = 1 },
    [19] = { name = '能量饮料', type = 'item', item = 'energydrink', quantity = 10 },
    [20] = { name = '现金', type = 'money', item = nil, quantity = 3000 },
    [21] = { name = '传说武器', type = 'weapon', item = 'weapon_pistol', quantity = 1, special = true },
    [22] = { name = '金条', type = 'item', item = 'goldbar', quantity = 2 },
    [23] = { name = '弹药', type = 'item', item = 'ammo', quantity = 100 },
    [24] = { name = '护甲', type = 'item', item = 'armor', quantity = 1 },
    [25] = { name = '钻石', type = 'item', item = 'diamond', quantity = 5 },
    [26] = { name = '现金', type = 'money', item = nil, quantity = 5000 },
    [27] = { name = '修理包', type = 'item', item = 'repairkit', quantity = 3 },
    [28] = { name = '超级载具', type = 'vehicle', model = 'adder', quantity = 1, special = true }, -- 车辆奖励示例
}

---@class StreakBonusConfig
---@field type 'money'|'item' 奖励类型
---@field quantity number 奖励数量

---@type table<number, StreakBonusConfig> 连续签到额外奖励（可选）
Config.StreakBonus = {
    [3]  = { type = 'money', quantity = 1000 },  -- 连续3天额外奖励
    [7]  = { type = 'money', quantity = 2000 },  -- 连续7天额外奖励
    [14] = { type = 'money', quantity = 5000 },  -- 连续14天额外奖励
    [21] = { type = 'money', quantity = 10000 }, -- 连续21天额外奖励
    [28] = { type = 'money', quantity = 20000 }, -- 连续28天额外奖励
}

-- 通知设置
Config.Notifications = {
    claimSuccess = '成功领取第 %d 天奖励: %s x%d',
    alreadyClaimed = '今日奖励已领取，请明天再来',
    notAvailable = '该奖励尚未解锁',
    streakBonus = '连续签到 %d 天，额外获得 $%d',
}
