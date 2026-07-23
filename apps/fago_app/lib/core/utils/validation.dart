class ValidationUtils {
  static String? validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Full name is required';
    }
    final trimmed = value.trim();
    if (trimmed.length < 3) {
      return 'Full name must be at least 3 characters long';
    }
    if (!RegExp(r'^[a-zA-Z\s.-]+$').hasMatch(trimmed)) {
      return 'Full name can only contain letters and spaces';
    }
    final lower = trimmed.toLowerCase();
    final junk = ['adasd', 'asdf', 'test', 'dummy', 'xxxx', '1234', 'aaaa', 'qwerty'];
    if (junk.any((j) => lower.contains(j))) {
      return 'Please enter a valid real full name';
    }
    return null;
  }

  static String? validateIndianPhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    final digits = value.replaceAll(RegExp(r'\D'), '');
    final clean = digits.length >= 10 ? digits.substring(digits.length - 10) : digits;
    if (clean.length != 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(clean)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    final junk = ['0000000000', '1234567890', '9999999999', '8888888888', '7777777777', '9876543210'];
    if (junk.contains(clean)) {
      return 'Please enter a valid active 10-digit mobile number';
    }
    return null;
  }
}
