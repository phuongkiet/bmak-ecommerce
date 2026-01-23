/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Vietnam format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Validate required field
 */
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Get validation error message
 */
export const getValidationError = (field: string, value: string): string | null => {
  if (!isRequired(value)) {
    return `${field} là bắt buộc`
  }
  
  if (field.toLowerCase().includes('email') && !isValidEmail(value)) {
    return 'Email không hợp lệ'
  }
  
  if (field.toLowerCase().includes('phone') && !isValidPhone(value)) {
    return 'Số điện thoại không hợp lệ'
  }
  
  if (field.toLowerCase().includes('password') && !isValidPassword(value)) {
    return 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
  }
  
  return null
}





