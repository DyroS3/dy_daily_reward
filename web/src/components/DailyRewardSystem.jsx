import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import RewardCell from './RewardCell'
import Tooltip from './Tooltip'

// 是否在 FiveM NUI 环境中
const isNUI = window.invokeNative !== undefined

// 图片基础路径
const IMAGE_BASE_PATH = isNUI ? 'nui://dy_daily_reward/web/images' : '/images'

// 音效路径
const SOUND_PATH = isNUI ? 'nui://dy_daily_reward/web/game-reward.ogg' : '/game-reward.ogg'

// 播放领取音效
const playRewardSound = () => {
  try {
    const audio = new Audio(SOUND_PATH)
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (e) {
    // 忽略音频播放错误
  }
}

// 向 Lua 发送消息
const postNUI = (action, data = {}) => {
  if (!isNUI) return
  fetch(`https://dy_daily_reward/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

// 支持的图片格式（按优先级）
const IMAGE_FORMATS = ['webp', 'png']

// 获取奖励图片路径（返回基础路径，由 img onError 处理格式回退）
const getRewardImage = (reward) => {
  if (!reward) return { basePath: `${IMAGE_BASE_PATH}/no_item`, name: 'no_item' }

  const { type, item, model } = reward

  // 根据类型确定图片路径
  let folder = 'items'
  let name = item

  if (type === 'vehicle' && model) {
    folder = 'vehicles'
    name = model
  } else if ((type === 'item' || type === 'weapon') && item) {
    folder = 'items'
    name = item
  } else if (type === 'money' || type === 'bank') {
    folder = 'items'
    name = 'money'
  }

  if (!name) return { basePath: `${IMAGE_BASE_PATH}/no_item`, name: 'no_item' }

  return {
    basePath: `${IMAGE_BASE_PATH}/${folder}/${name}`,
    name: name
  }
}

// 默认奖励数据（开发模式使用）
const DEFAULT_REWARDS = [
  { name: '金币', type: 'money', item: null, quantity: 500 },
  { name: '皮革', type: 'item', item: 'leather', quantity: 5 },
  { name: '现金', type: 'money', item: null, quantity: 500 },
  { name: '绷带', type: 'item', item: 'bandage', quantity: 10 },
  { name: '金属', type: 'item', item: 'iron', quantity: 3 },
  { name: '水晶', type: 'item', item: 'crystal', quantity: 1 },
  { name: '神秘宝箱', type: 'item', item: 'mysterybox', quantity: 1 },
  { name: '布料', type: 'item', item: 'cloth', quantity: 8 },
  { name: '现金', type: 'money', item: null, quantity: 1000 },
  { name: '医疗包', type: 'item', item: 'medkit', quantity: 3 },
  { name: '砖块', type: 'item', item: 'brick', quantity: 20 },
  { name: '塑料', type: 'item', item: 'plastic', quantity: 10 },
  { name: '三明治', type: 'item', item: 'sandwich', quantity: 5 },
  { name: '高级宝箱', type: 'item', item: 'premiumbox', quantity: 1 },
  { name: '现金', type: 'money', item: null, quantity: 2000 },
  { name: '肾上腺素', type: 'item', item: 'adrenaline', quantity: 5 },
  { name: '铁锭', type: 'item', item: 'ironingot', quantity: 15 },
  { name: '工具箱', type: 'item', item: 'toolbox', quantity: 1 },
  { name: '能量饮料', type: 'item', item: 'energydrink', quantity: 10 },
  { name: '现金', type: 'money', item: null, quantity: 3000 },
  { name: '传说武器', type: 'weapon', item: 'weapon_pistol', quantity: 1 },
  { name: '金条', type: 'item', item: 'goldbar', quantity: 2 },
  { name: '弹药', type: 'item', item: 'ammo', quantity: 100 },
  { name: '护甲', type: 'item', item: 'armor', quantity: 1 },
  { name: '钻石', type: 'item', item: 'diamond', quantity: 5 },
  { name: '现金', type: 'money', item: null, quantity: 5000 },
  { name: '修理包', type: 'item', item: 'repairkit', quantity: 3 },
  { name: '超级载具', type: 'vehicle', model: 'adder', quantity: 1 },
]

// 特殊奖励日
const DEFAULT_SPECIAL_DAYS = [3, 7, 14, 21, 28]

// 生成奖励数据
const generateRewardsData = (serverData = null) => {
  const specialDays = serverData?.specialDays || DEFAULT_SPECIAL_DAYS
  const claimedDays = serverData?.claimedDays || []
  const currentDay = serverData?.currentDay || 3 // 开发模式默认第3天
  const rewards = serverData?.rewards || null

  return Array.from({ length: 28 }, (_, index) => {
    const day = index + 1
    const isSpecial = specialDays.includes(day)

    // 从服务器数据或默认数据获取奖励信息
    const reward = rewards ? rewards[day] : DEFAULT_REWARDS[index]
    const rewardInfo = reward || { name: '奖励', type: 'item', item: null, quantity: 1 }

    // 状态判断
    let status = 'locked'
    if (claimedDays.includes(day)) {
      status = 'claimed'
    } else if (day === currentDay) {
      status = 'available'
    } else if (day < currentDay) {
      status = 'locked'
    }

    return {
      id: day,
      day,
      name: rewardInfo.name,
      image: getRewardImage(rewardInfo),
      quantity: rewardInfo.quantity,
      status,
      isSpecial,
    }
  })
}

// 计算距离明天0点的倒计时
const getTimeUntilReset = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow - now
}

const formatTime = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const DailyRewardSystem = () => {
  const [rewards, setRewards] = useState(() => generateRewardsData())
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const [isOpen, setIsOpen] = useState(!isNUI) // NUI 模式默认关闭，等待 Lua 打开
  const [countdown, setCountdown] = useState(getTimeUntilReset())
  const [claimingId, setClaimingId] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  // 监听来自 Lua 的消息
  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data
      if (!message || !message.action) return

      switch (message.action) {
        case 'open':
          // Lua 发送打开指令和数据
          setRewards(generateRewardsData(message.data))
          setIsOpen(true)
          setShouldRender(true)
          break
        case 'close':
          setIsOpen(false)
          break
        case 'claimSuccess':
          // 领取成功，更新状态并播放音效
          playRewardSound()
          setRewards(prev => prev.map(r =>
            r.id === message.day ? { ...r, status: 'claimed' } : r
          ))
          setClaimingId(null)
          break
        case 'claimFailed':
          // 领取失败，重置状态
          setClaimingId(null)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseWithAnimation()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 实时倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilReset())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 领取奖励
  const handleClaim = useCallback((reward) => {
    if (reward.status !== 'available' || claimingId) return

    setClaimingId(reward.id)

    if (isNUI) {
      // NUI 模式：发送给 Lua 处理
      postNUI('claim', { day: reward.id })
    } else {
      // 开发模式：模拟领取
      setTimeout(() => {
        playRewardSound()
        setRewards(prev => prev.map(r =>
          r.id === reward.id ? { ...r, status: 'claimed' } : r
        ))
        setClaimingId(null)
      }, 600)
    }
  }, [claimingId])

  const handleMouseEnter = (e, reward) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
      reward: reward, // 传递完整奖励数据
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false })
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // 统计已签到天数
  const claimedDays = rewards.filter(r => r.status === 'claimed').length

  // 关闭动画处理
  const handleCloseWithAnimation = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsAnimating(false)
      setShouldRender(false)
      // 通知 Lua 关闭
      postNUI('close')
    }, 200)
  }, [])

  // 打开时重置渲染状态
  const handleOpen = () => {
    setShouldRender(true)
    setIsOpen(true)
  }

  // NUI 模式下不显示按钮，等待 Lua 打开
  if (!isOpen && isNUI) {
    return null
  }

  // 开发模式下显示打开按钮
  if (!shouldRender && !isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="px-6 py-3 bg-game-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
      >
        打开每日签到
      </button>
    )
  }

  return (
    <div className="relative w-full" style={{ maxWidth: '1100px' }}>
      {/* Modal Container - 带开启/关闭动画 */}
      <div
        className={`relative overflow-hidden transition-all duration-200 ease-out ${
          isAnimating
            ? 'opacity-0 scale-95 translate-y-2'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          animation: !isAnimating ? 'slideIn 0.25s ease-out' : 'none',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3">
          <div>
            <h1
              className="text-xl font-bold"
              style={{
                color: '#E8C547',
              }}
            >
              每日签到奖励
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              每天登录领取专属奖励，连续签到惊喜更多
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleCloseWithAnimation}
            className="text-gray-400 hover:text-white transition-colors text-xl px-2 hover:rotate-90 duration-200"
          >
            ✕
          </button>
        </div>

        {/* Grid Container */}
        <div className="px-3 pb-3 pt-2">
          <div
            className="grid overflow-visible"
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {rewards.map((reward) => (
              <RewardCell
                key={reward.id}
                reward={reward}
                isClaiming={claimingId === reward.id}
                onClaim={handleClaim}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        </div>

        {/* Footer - 进度条和倒计时 */}
        <div className="px-4 py-3 border-t border-white/5">
          {/* 进度条可视化 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-500 w-12">进度</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(claimedDays / 28) * 100}%`,
                  background: 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)',
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.4)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: '#4ADE80' }}>
              {claimedDays}/28
            </span>
          </div>

          {/* 底部信息栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>已连续签到 {claimedDays} 天</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">重置倒计时</span>
              <span
                className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  color: '#FFC107',
                }}
              >
                {formatTime(countdown)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        reward={tooltip.reward}
      />
    </div>
  )
}

export default DailyRewardSystem
