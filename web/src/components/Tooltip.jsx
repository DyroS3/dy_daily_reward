import { Sparkles } from 'lucide-react'

const Tooltip = ({ visible, x, y, reward }) => {
  if (!visible || !reward) return null

  const statusText = {
    claimed: '已领取',
    available: '可领取',
    locked: '未解锁',
  }

  const statusColor = {
    claimed: '#4ADE80',
    available: '#FFD700',
    locked: '#6B7280',
  }

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="px-3 py-2 text-sm min-w-[140px]"
        style={{
          background: 'rgba(20, 20, 20, 0.95)',
          color: '#FFFFFF',
          border: reward.isSpecial
            ? '1px solid rgba(255, 193, 7, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '4px',
          boxShadow: reward.isSpecial
            ? '0 0 12px rgba(255, 193, 7, 0.2)'
            : '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* 特殊日标识 */}
        {reward.isSpecial && (
          <div
            className="flex items-center gap-1 text-xs mb-1 pb-1"
            style={{
              color: '#FFC107',
              borderBottom: '1px solid rgba(255, 193, 7, 0.3)',
            }}
          >
            <Sparkles size={12} />
            <span>特殊奖励日</span>
          </div>
        )}

        {/* 奖励名称和数量 */}
        <div className="font-medium text-base" style={{ color: '#E8C547' }}>
          {reward.name}
        </div>
        <div className="text-gray-300 text-xs mt-0.5">
          数量: <span className="text-white">x{reward.quantity}</span>
        </div>

        {/* 天数 */}
        <div className="text-gray-400 text-xs mt-1">
          第 {reward.day} 天
        </div>

        {/* 状态 */}
        <div
          className="text-xs mt-1 font-medium"
          style={{ color: statusColor[reward.status] }}
        >
          {statusText[reward.status]}
        </div>
      </div>
    </div>
  )
}

export default Tooltip
