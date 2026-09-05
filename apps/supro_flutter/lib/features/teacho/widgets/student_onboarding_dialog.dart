import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/tuto_oci_service.dart';

class AcademicClassItem {
  final String id;
  final String label;
  final String gradeLevel;

  const AcademicClassItem({
    required this.id,
    required this.label,
    required this.gradeLevel,
  });
}

class CareerInterestItem {
  final String id;
  final String label;
  final String roleTag;
  final String desc;
  final Color color;
  final String icon;
  final String recommendedCourseId;

  const CareerInterestItem({
    required this.id,
    required this.label,
    required this.roleTag,
    required this.desc,
    required this.color,
    required this.icon,
    required this.recommendedCourseId,
  });
}

const List<AcademicClassItem> ACADEMIC_CLASSES = [
  AcademicClassItem(id: 'class_lkg', label: '🧸 LKG (Lower KG)', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_ukg', label: '🎨 UKG (Upper KG)', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_1', label: 'Class 1st Std', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_2', label: 'Class 2nd Std', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_3', label: 'Class 3rd Std', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_4', label: 'Class 4th Std', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_5', label: 'Class 5th Std (Primary)', gradeLevel: 'primary'),
  AcademicClassItem(id: 'class_6', label: 'Class 6th Std (Middle)', gradeLevel: 'middle'),
  AcademicClassItem(id: 'class_7', label: 'Class 7th Std (Middle)', gradeLevel: 'middle'),
  AcademicClassItem(id: 'class_8', label: 'Class 8th Std (Middle)', gradeLevel: 'middle'),
  AcademicClassItem(id: 'class_9', label: 'Class 9th Std (High)', gradeLevel: 'high'),
  AcademicClassItem(id: 'class_10', label: 'Class 10th (SSLC)', gradeLevel: 'high'),
  AcademicClassItem(id: 'class_11', label: 'Class 11th (HSC +1)', gradeLevel: 'hsc'),
  AcademicClassItem(id: 'class_12', label: 'Class 12th (HSC +2)', gradeLevel: 'hsc'),
  AcademicClassItem(id: 'college_ug', label: 'College / Degree (UG/PG)', gradeLevel: 'college'),
  AcademicClassItem(id: 'competitive', label: 'Competitive / Govt Exams', gradeLevel: 'exam'),
];

const List<CareerInterestItem> CAREER_INTERESTS = [
  CareerInterestItem(
    id: 'jr-ias',
    label: '🏛️ JrIAS (Civil Servant)',
    roleTag: 'District Collector & Polity',
    desc: 'Indian Constitution, Public Policy & District Administration',
    color: Color(0xFFF59E0B),
    icon: '🏛️',
    recommendedCourseId: 'jr-ias',
  ),
  CareerInterestItem(
    id: 'jr-ar',
    label: '📊 JrAR (Auditor / CA)',
    roleTag: 'CA & Corporate Finance',
    desc: 'Double-Entry Bookkeeping, Financial Statements, GST & Auditing Standards',
    color: Color(0xFF10B981),
    icon: '📊',
    recommendedCourseId: 'jr-ar',
  ),
  CareerInterestItem(
    id: 'jr-dr',
    label: '🩺 JrDR (Doctor / NEET)',
    roleTag: 'Clinical Biology & NEET',
    desc: 'Human Anatomy, Major Organ Systems, First Aid & Clinical Diagnostics',
    color: Color(0xFFEC4899),
    icon: '🩺',
    recommendedCourseId: 'jr-dr',
  ),
  CareerInterestItem(
    id: 'jr-er',
    label: '💻 JrER (Engineer / Tech)',
    roleTag: 'Coding, AI & Robotics',
    desc: 'Algorithms, Circuit Analysis, Embedded Robotics & Applied Physics',
    color: Color(0xFF3B82F6),
    icon: '💻',
    recommendedCourseId: 'jr-er',
  ),
  CareerInterestItem(
    id: 'jr-ips',
    label: '👮 JrIPS (Police & Law)',
    roleTag: 'Criminology & Public Safety',
    desc: 'Forensics, Cyber Crime Investigation, Law & Tactical Leadership',
    color: Color(0xFF06B6D4),
    icon: '👮',
    recommendedCourseId: 'jr-ips',
  ),
  CareerInterestItem(
    id: 'jr-ceo',
    label: '🚀 JrCEO (Entrepreneur)',
    roleTag: 'Startup & Business Leader',
    desc: 'Venture Creation, Unit Economics, Marketing & Pitch Decks',
    color: Color(0xFF8B5CF6),
    icon: '🚀',
    recommendedCourseId: 'jr-ceo',
  ),
  CareerInterestItem(
    id: 'jr-scientist',
    label: '🔬 JrScientist (ISRO)',
    roleTag: 'Space Tech & Deep Physics',
    desc: 'Rocket Propulsion, Satellite Systems & Planetary Science',
    color: Color(0xFF14B8A6),
    icon: '🔬',
    recommendedCourseId: 'jr-scientist',
  ),
  CareerInterestItem(
    id: 'jr-judge',
    label: '⚖️ JrJudge (Judiciary)',
    roleTag: 'Justice & Legal Master',
    desc: 'Constitutional Rights, Courtroom Ethics & Landmark Case Analysis',
    color: Color(0xFFF97316),
    icon: '⚖️',
    recommendedCourseId: 'jr-judge',
  ),
];

class SchoolBoardOption {
  final String id;
  final String name;
  final String tagline;

  const SchoolBoardOption({
    required this.id,
    required this.name,
    required this.tagline,
  });
}

const List<SchoolBoardOption> SCHOOL_BOARDS = [
  SchoolBoardOption(id: 'TNSB', name: 'Tamil Nadu State Board (TNSB)', tagline: 'Samacheer Kalvi standard curriculum'),
  SchoolBoardOption(id: 'CBSE', name: 'Central Board (CBSE)', tagline: 'NCERT standard pan-India syllabus'),
  SchoolBoardOption(id: 'MATRIC', name: 'Matriculation Board', tagline: 'English medium advanced state stream'),
  SchoolBoardOption(id: 'ICSE', name: 'ICSE / ISC Board', tagline: 'Comprehensive national curriculum'),
];

class StudentOnboardingDialog extends StatefulWidget {
  final String initialName;
  final String userPhone;
  final Function(String courseId, String board, String ambitionId, String studentName) onComplete;

  const StudentOnboardingDialog({
    super.key,
    this.initialName = '',
    this.userPhone = '',
    required this.onComplete,
  });

  static Future<void> show(
    BuildContext context, {
    String initialName = '',
    String userPhone = '',
    required Function(String courseId, String board, String ambitionId, String studentName) onComplete,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StudentOnboardingDialog(
        initialName: initialName,
        userPhone: userPhone,
        onComplete: onComplete,
      ),
    );
  }

  @override
  State<StudentOnboardingDialog> createState() => _StudentOnboardingDialogState();
}

class _StudentOnboardingDialogState extends State<StudentOnboardingDialog> {
  int _step = 1;
  late TextEditingController _nameController;
  String _selectedClass = 'class_5';
  String _selectedBoard = 'TNSB';
  String _selectedInterest = 'jr-ias';
  String _selectedCourseId = 'jr-ias';
  String _coursePickType = 'featured'; // 'featured' | 'curriculum'
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName.isNotEmpty ? widget.initialName : 'SuprO Scholar');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _handleNextStep() {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter student\'s full name')),
      );
      return;
    }
    setState(() {
      _step = 2;
      _selectedCourseId = _selectedInterest;
    });
  }

  Future<void> _handleFinish() async {
    setState(() => _isSaving = true);
    final studentName = _nameController.text.trim();
    final finalCourseId = _selectedCourseId.isNotEmpty ? _selectedCourseId : _selectedInterest;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('tuto_student_onboarding_completed', 'true');
      await prefs.setString('tuto_active_course_id', finalCourseId);
      await prefs.setString('tuto_active_ambition_id', _selectedInterest);
      await prefs.setString('user-course-id', finalCourseId);
      await prefs.setString('user-board', _selectedBoard);
      await prefs.setString('user-name', studentName);
      await prefs.setString('student-academic-class', _selectedClass);
      await prefs.setString('student-area-interest', _selectedInterest);

      // 100% OCI Cloud Backend Sync (Zero Supabase)
      final storedPhone = prefs.getString('user-phone') ?? '';
      final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : storedPhone;

      await TutoOciService.syncProfile(
        phone: cleanPhone,
        fullName: studentName,
        academicClass: _selectedClass,
        schoolBoard: _selectedBoard,
        futuristicAmbition: _selectedInterest,
        activeCourseId: finalCourseId,
      );

      if (mounted) {
        Navigator.pop(context);
        widget.onComplete(finalCourseId, _selectedBoard, _selectedInterest, studentName);
      }
    } catch (e) {
      print('Onboarding save error: $e');
      if (mounted) {
        Navigator.pop(context);
        widget.onComplete(finalCourseId, _selectedBoard, _selectedInterest, studentName);
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Container(
      height: size.height * 0.90,
      decoration: const BoxDecoration(
        color: Color(0xFF0B1120),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
        border: Border(
          top: BorderSide(color: Color(0xFF1E293B), width: 1),
          left: BorderSide(color: Color(0xFF1E293B), width: 1),
          right: BorderSide(color: Color(0xFF1E293B), width: 1),
        ),
      ),
      child: Column(
        children: [
          // ─── Top Header ───
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B), width: 1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00D084).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF00D084).withOpacity(0.3)),
                            ),
                            child: Text(
                              'STEP $_step OF 2',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF00D084),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'TutO Academic Personalization',
                            style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _step == 1 ? '🎓 Student & Career Profile' : '📚 Select Your Learning Track',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, size: 18, color: Color(0xFF94A3B8)),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    padding: const EdgeInsets.all(6),
                  ),
                ),
              ],
            ),
          ),

          // ─── Scrollable Body ───
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _step == 1 ? _buildStep1() : _buildStep2(),
            ),
          ),

          // ─── Bottom Footer Actions ───
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF0B1120),
              border: Border(top: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Row(
              children: [
                if (_step == 2) ...[
                  OutlinedButton(
                    onPressed: () => setState(() => _step = 1),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFCBD5E1),
                      side: const BorderSide(color: Color(0xFF1E293B)),
                      backgroundColor: const Color(0xFF1E293B),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('← Back', style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : (_step == 1 ? _handleNextStep : _handleFinish),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00D084),
                      foregroundColor: const Color(0xFF070C18),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 4,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF070C18)),
                          )
                        : Text(
                            _step == 1 ? 'Continue to Course Selection →' : '🚀 Start 365-Day TutO Deck',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── STEP 1: IDENTITY, 16 ACADEMIC CLASSES & 8 CAREER AMBITIONS ───
  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Full Name
        Row(
          children: const [
            Icon(LucideIcons.user, size: 14, color: Color(0xFF00D084)),
            SizedBox(width: 6),
            Text('Student Full Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC))),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _nameController,
          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            hintText: 'Enter student\'s name (e.g. Vignesh R)',
            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            filled: true,
            fillColor: const Color(0xFF0E172A),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF1E293B)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF1E293B)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF00D084)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
        const SizedBox(height: 18),

        // 2. Current Class / Academic Level (16 chips including LKG/UKG)
        Row(
          children: const [
            Icon(LucideIcons.school, size: 14, color: Color(0xFF38BDF8)),
            SizedBox(width: 6),
            Text('Current Class / Academic Level', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC))),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ACADEMIC_CLASSES.map((cls) {
            final isSelected = _selectedClass == cls.id;
            return InkWell(
              onTap: () => setState(() => _selectedClass = cls.id),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF38BDF8).withOpacity(0.15) : const Color(0xFF0E172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF1E293B),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Text(
                  cls.label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                    color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF94A3B8),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 18),

        // 3. School Board
        Row(
          children: const [
            Icon(LucideIcons.bookOpen, size: 14, color: Color(0xFFF59E0B)),
            SizedBox(width: 6),
            Text('Educational Board & Standard', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC))),
          ],
        ),
        const SizedBox(height: 8),
        Column(
          children: SCHOOL_BOARDS.map((board) {
            final isSelected = _selectedBoard == board.id;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF00D084).withOpacity(0.08) : const Color(0xFF0E172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? const Color(0xFF00D084) : const Color(0xFF1E293B),
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              child: ListTile(
                dense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                title: Text(
                  board.name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? const Color(0xFF00D084) : const Color(0xFFF8FAFC),
                  ),
                ),
                subtitle: Text(
                  board.tagline,
                  style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
                trailing: isSelected
                    ? const Icon(LucideIcons.checkCircle2, size: 18, color: Color(0xFF00D084))
                    : null,
                onTap: () => setState(() => _selectedBoard = board.id),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 18),

        // 4. 8 Career Ambitions
        Row(
          children: const [
            Icon(LucideIcons.target, size: 14, color: Color(0xFFEC4899)),
            SizedBox(width: 6),
            Text('Dream Career Goal & Area of Interest', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC))),
          ],
        ),
        const SizedBox(height: 4),
        const Text(
          'Personalizes daily leadership lessons, case studies & problem solving:',
          style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
        ),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 2.2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: CAREER_INTERESTS.length,
          itemBuilder: (ctx, i) {
            final item = CAREER_INTERESTS[i];
            final isSelected = _selectedInterest == item.id;
            return InkWell(
              onTap: () => setState(() => _selectedInterest = item.id),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSelected ? item.color.withOpacity(0.12) : const Color(0xFF0E172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? item.color : const Color(0xFF1E293B),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(item.icon, style: const TextStyle(fontSize: 16)),
                    const SizedBox(height: 2),
                    Text(
                      item.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                        color: isSelected ? item.color : const Color(0xFFCBD5E1),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // ─── STEP 2: COURSE SELECTION ───
  Widget _buildStep2() {
    final recommendedInterest = CAREER_INTERESTS.firstWhere(
      (c) => c.id == _selectedInterest,
      orElse: () => CAREER_INTERESTS.first,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Switcher Tabs
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: const Color(0xFF0E172A),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() {
                    _coursePickType = 'featured';
                    _selectedCourseId = _selectedInterest;
                  }),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _coursePickType == 'featured' ? const Color(0xFF00D084) : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '⭐ Recommended Career Track',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: _coursePickType == 'featured' ? const Color(0xFF070C18) : const Color(0xFF94A3B8),
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() {
                    _coursePickType = 'curriculum';
                    _selectedCourseId = _selectedClass;
                  }),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _coursePickType == 'curriculum' ? const Color(0xFF00D084) : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '🏫 Class Curriculum Course',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: _coursePickType == 'curriculum' ? const Color(0xFF070C18) : const Color(0xFF94A3B8),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (_coursePickType == 'featured') ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF131F37),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.sparkles, size: 16, color: Color(0xFFF59E0B)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Curated 365-Day Leadership & Knowledge Track based on your aspiration:',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFCBD5E1)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Career tracks list
          Column(
            children: CAREER_INTERESTS.map((item) {
              final isSelected = _selectedCourseId == item.id;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF00D084).withOpacity(0.08) : const Color(0xFF0E172A),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF00D084) : const Color(0xFF1E293B),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  leading: Text(item.icon, style: const TextStyle(fontSize: 22)),
                  title: Text(
                    item.label,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                  subtitle: Text(
                    '${item.roleTag} • ${item.desc}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                  ),
                  trailing: isSelected
                      ? const Icon(LucideIcons.checkCircle2, size: 20, color: Color(0xFF00D084))
                      : Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF475569), width: 1.5),
                          ),
                        ),
                  onTap: () => setState(() => _selectedCourseId = item.id),
                ),
              );
            }).toList(),
          ),
        ] else ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF131F37),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.school, size: 16, color: Color(0xFF38BDF8)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Textbook & Board Aligned Academic Curriculum for ${ACADEMIC_CLASSES.firstWhere((c) => c.id == _selectedClass).label}:',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFCBD5E1)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF00D084).withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF00D084), width: 1.5),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFF00D084).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(LucideIcons.layers, size: 18, color: Color(0xFF00D084)),
              ),
              title: Text(
                '${ACADEMIC_CLASSES.firstWhere((c) => c.id == _selectedClass).label} Academic Master Deck',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
              ),
              subtitle: Text(
                'Full 365 Days • $_selectedBoard Board Curriculum • Dual Medium',
                style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
              ),
              trailing: const Icon(LucideIcons.checkCircle2, size: 20, color: Color(0xFF00D084)),
              onTap: () {},
            ),
          ),
        ],
      ],
    );
  }
}
