import { Check, Lock, Sparkles } from 'lucide-react'

const RewardCell = ({ reward, isClaiming, onClaim, onMouseEnter, onMouseLeave }) => {
  const { day, image, quantity, status, isSpecial } = reward

  // 状态样式
  const getStatusStyles = () => {
    switch (status) {
      case 'claimed':
        return {
          bg: 'rgba(20, 20, 20, 0.3)',
          filter: 'brightness(0.4) grayscale(0.3)',
          cursor: 'default',
        }
      case 'available':
        return {
          bg: 'rgba(34, 197, 94, 0.08)',
          filter: 'none',
          cursor: 'pointer',
        }
      case 'locked':
      default:
        return {
          bg: 'rgba(20, 20, 20, 0.5)',
          filter: 'brightness(0.6) grayscale(0.2)',
          cursor: 'not-allowed',
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <div
      className={`relative aspect-square flex items-center justify-center group transition-all duration-200 ${
        isClaiming ? 'scale-95' : ''
      }`}
      style={{
        background: styles.bg,
        border: isSpecial
          ? '1px solid rgba(255, 193, 7, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '4px',
        cursor: styles.cursor,
      }}
      onClick={() => onClaim(reward)}
      onMouseEnter={(e) => onMouseEnter(e, reward)}
      onMouseLeave={onMouseLeave}
    >
      {/* 特殊日金色光晕背景 + 动画 */}
      {isSpecial && (
        <>
          {/* 旋转光芒 */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: '4px' }}
          >
            <div
              className="absolute inset-[-50%] animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255, 193, 7, 0.3), transparent, rgba(255, 193, 7, 0.3), transparent)',
                animationDuration: '4s',
              }}
            />
          </div>
          {/* 内层遮罩 */}
          <div
            className="absolute inset-[2px] pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '3px',
            }}
          />
          {/* 金色光晕 */}
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 193, 7, 0.25) 0%, transparent 60%)',
              animationDuration: '2s',
            }}
          />
        </>
      )}

      {/* 可领取状态 - 呼吸动画边框 */}
      {status === 'available' && !isClaiming && (
        <>
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              border: '2px solid #4ADE80',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 15px rgba(74, 222, 128, 0.2), 0 0 8px rgba(74, 222, 128, 0.3)',
            }}
          />
          {/* 今日标签 */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
              color: '#000',
              fontSize: '9px',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            今日
          </div>
        </>
      )}

      {/* Hover Border Effect */}
      {status !== 'claimed' && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20"
          style={{
            border: '2px solid #FFD700',
            borderRadius: '4px',
            background: 'rgba(255, 215, 0, 0.05)',
          }}
        />
      )}

      {/* Day Number - 右上角 */}
      <div
        className="absolute top-1 right-1.5 text-xs z-10 font-medium"
        style={{
          color: isSpecial ? '#FFC107' : 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {day}
      </div>

      {/* 特殊日标识 - 左上角星星 */}
      {isSpecial && (
        <div className="absolute top-1 left-1 z-10">
          <Sparkles size={12} style={{ color: '#FFC107' }} />
        </div>
      )}

      {/* Reward Image */}
      <img
        src={`${image.basePath}.webp`}
        alt={reward.name}
        className={`w-3/5 h-3/5 object-contain transition-all duration-300 ${
          status === 'available' ? 'group-hover:scale-110' : ''
        } ${isClaiming ? 'scale-150 opacity-0' : ''}`}
        style={{
          filter: styles.filter,
        }}
        onError={(e) => {
          const currentSrc = e.target.src
          const basePath = window.invokeNative ? 'nui://dy_daily_reward/web/images' : '/images'

          // webp 失败 -> 尝试 png
          if (currentSrc.endsWith('.webp')) {
            e.target.src = `${image.basePath}.png`
          }
          // png 也失败 -> 使用备用图片
          else if (!currentSrc.includes('no_item')) {
            e.target.onerror = null
            e.target.src = `${basePath}/no_item.png`
          }
        }}
      />

      {/* 物品数量角标 - 左下角 */}
      {quantity > 1 && (
        <div
          className="absolute bottom-1 left-1 text-xs font-medium z-10 px-1 rounded"
          style={{
            color: '#FFFFFF',
            background: 'rgba(0, 0, 0, 0.6)',
            fontSize: '10px',
          }}
        >
          x{quantity}
        </div>
      )}

      {/* 已领取覆盖层 - 绿色对勾 */}
      {status === 'claimed' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="rounded-full p-1"
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid #4ADE80',
            }}
          >
            <Check
              size={20}
              strokeWidth={3}
              style={{ color: '#4ADE80' }}
            />
          </div>
        </div>
      )}

      {/* 未解锁覆盖层 - 锁图标 */}
      {status === 'locked' && (
        <div className="absolute bottom-1 right-1 z-10">
          <Lock size={10} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
        </div>
      )}

      {/* 领取动画 - 光效 */}
      {isClaiming && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div
            className="w-full h-full animate-ping"
            style={{
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.6) 0%, transparent 70%)',
            }}
          />
          <Check
            size={32}
            strokeWidth={3}
            className="absolute animate-bounce"
            style={{ color: '#4ADE80' }}
          />
        </div>
      )}
    </div>
  )
}

export default RewardCell
