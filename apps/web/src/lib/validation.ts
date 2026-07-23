/**
 * Strict Input Validation Suite for FAGO Super App & DriveO Portal
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates user's full name (minimum 3 chars, letters and spaces only, no junk strings like 'adasd', 'asdf', '123')
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Full name must be at least 3 characters long.' };
  }
  // Check for letters, spaces, dots, and hyphens only
  const nameRegex = /^[a-zA-Z\s.-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Full name can only contain alphabetic letters and spaces.' };
  }
  // Block common junk repetitive strings
  const lower = trimmed.toLowerCase();
  const junkPatterns = ['adasd', 'asdf', 'test', 'dummy', 'xxxx', '1234', 'aaaa', 'qwerty'];
  if (junkPatterns.some(j => lower.includes(j))) {
    return { isValid: false, error: 'Please enter your actual valid full name.' };
  }

  return { isValid: true };
}

/**
 * Validates Indian 10-digit mobile number starting with 6, 7, 8, or 9
 */
export function validateIndianPhone(phone: string): ValidationResult {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (!digits || digits.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits long.' };
  }
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9.' };
  }
  // Block dummy repeated numbers like 0000000000, 1234567890, 9999999999
  const junkPhones = ['0000000000', '1234567890', '9999999999', '8888888888', '7777777777', '9876543210'];
  if (junkPhones.includes(digits)) {
    return { isValid: false, error: 'Please enter a valid, active 10-digit mobile number.' };
  }

  return { isValid: true };
}

/**
 * Validates Indian Vehicle Registration Number (e.g. TN-39-AB-1234, PY01A9999, KA-05-MN-5678)
 */
export function validateVehicleRegNumber(regNo: string): ValidationResult {
  const trimmed = regNo.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!trimmed) {
    return { isValid: false, error: 'Vehicle registration number is required.' };
  }
  // Indian Vehicle Reg Pattern: StateCode (2 letters) + RTO (2 digits) + Series (1-3 letters) + Number (4 digits)
  const vehicleRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
  if (!vehicleRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid Vehicle Number format. Example format: TN-39-AB-1234 or PY-01-A-9999' };
  }

  return { isValid: true };
}

/**
 * Validates Indian Driving License Number (e.g. TN-14-2024-0001234, TN2024998877)
 */
export function validateDrivingLicense(licenseNo: string): ValidationResult {
  const trimmed = licenseNo.trim().toUpperCase();
  if (!trimmed) {
    return { isValid: false, error: 'Driving License number is required.' };
  }
  if (trimmed === 'PENDING-VERIFICATION') {
    return { isValid: true };
  }
  const sanitized = trimmed.replace(/[\s-]/g, '');
  // DL Pattern: StateCode (2 letters) + 11-14 digits/alphanumerics
  if (sanitized.length < 9 || sanitized.length > 16 || !/^[A-Z]{2}[0-9A-Z]{7,14}$/.test(sanitized)) {
    return { isValid: false, error: 'Invalid Driving License format. Example format: TN-14-2024-0001234' };
  }

  return { isValid: true };
}

/**
 * Validates UPI ID (e.g. 9486335870@hdfcbank, user@upi, 9876543210@paytm)
 */
export function validateUpiId(upi: string): ValidationResult {
  const trimmed = upi.trim();
  if (!trimmed) {
    return { isValid: true }; // UPI can be auto-generated if optional
  }
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid UPI ID format. Example: 9486335870@hdfcbank or phone@upi' };
  }

  return { isValid: true };
}
