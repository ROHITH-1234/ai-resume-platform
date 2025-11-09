'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function GlassCard({ 
  children, 
  className = '',
  hover = true 
}: { 
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      } : {}}
      className={`
        backdrop-blur-sm bg-white dark:bg-gray-900/40
        border border-white dark:border-gray-700/20
        rounded-2xl shadow-lg
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedGradientBorder({ 
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-75 blur"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl">
        {children}
      </div>
    </div>
  )
}

export function FloatingElement({ 
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

export function PulseGlow({ 
  children,
  color = 'blue',
  className = ''
}: {
  children: ReactNode
  color?: 'blue' | 'purple' | 'pink' | 'green'
  className?: string
}) {
  const colors = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    pink: 'shadow-pink-500/50',
    green: 'shadow-green-500/50',
  }

  return (
    <motion.div
      className={`${className} ${colors[color]}`}
      animate={{
        boxShadow: [
          '0 0 20px rgba(59, 130, 246, 0.3)',
          '0 0 40px rgba(59, 130, 246, 0.6)',
          '0 0 20px rgba(59, 130, 246, 0.3)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedButton({ 
  children,
  onClick,
  variant = 'primary',
  className = ''
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 dark:text-blue-400',
  }

  return (
    <motion.button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-xl font-semibold
        ${variants[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.span
        className="inline-block"
        whileHover={{ x: [0, 5, 0] }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}
