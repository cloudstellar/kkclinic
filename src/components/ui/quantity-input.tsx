'use client'

import { useRef, useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuantityInputProps = {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    stockQty?: number  // for soft warning
    unit?: string
    autoFocus?: boolean
    className?: string
}

export function QuantityInput({
    value,
    onChange,
    min = 1,
    max = 999,
    stockQty,
    unit,
    autoFocus = false,
    className,
}: QuantityInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = useCallback((newValue: number) => {
        // Clamp value between min and max
        const clampedValue = Math.max(min, Math.min(max, newValue))
        onChange(clampedValue)
    }, [min, max, onChange])

    const increment = useCallback(() => {
        handleChange(value + 1)
    }, [value, handleChange])

    const decrement = useCallback(() => {
        handleChange(value - 1)
    }, [value, handleChange])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        if (inputValue === '') {
            // Allow empty temporarily, will reset on blur
            onChange(0)
        } else {
            const num = parseInt(inputValue, 10)
            if (!isNaN(num)) {
                handleChange(num)
            }
        }
    }

    const handleBlur = () => {
        // Reset to min if empty or 0
        if (value < min) {
            onChange(min)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            increment()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            decrement()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            inputRef.current?.blur()
        }
    }

    const isOverStock = stockQty !== undefined && value > stockQty
    const isZero = value === 0

    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center">
                {/* Decrement Button */}
                <button
                    type="button"
                    onClick={decrement}
                    disabled={value <= min}
                    className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-l-md border border-r-0 transition-colors",
                        "hover:bg-gray-100 active:bg-gray-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    )}
                    tabIndex={-1}
                >
                    <Minus className="w-4 h-4" />
                </button>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="number"
                    value={value === 0 ? '' : value}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-14 h-8 text-center border-y outline-none",
                        "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        isZero && "border-red-400 bg-red-50",
                        isOverStock && !isZero && "border-orange-300 bg-orange-50"
                    )}
                />

                {/* Increment Button */}
                <button
                    type="button"
                    onClick={increment}
                    disabled={value >= max}
                    className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-r-md border border-l-0 transition-colors",
                        "hover:bg-gray-100 active:bg-gray-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    )}
                    tabIndex={-1}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Warning Message */}
            {isOverStock && stockQty !== undefined && (
                <div className="text-xs text-orange-600 flex items-center gap-1">
                    <span>🔶</span>
                    <span>คงเหลือ {stockQty} {unit || 'หน่วย'}</span>
                </div>
            )}
        </div>
    )
}
