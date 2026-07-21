import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'teacho_service.dart';
import '../models/course_model.dart';

final teachOServiceProvider = Provider<TeachOService>((ref) {
  return TeachOService();
});

final teachOCoursesProvider = FutureProvider.autoDispose<List<CourseModel>>((ref) async {
  final service = ref.read(teachOServiceProvider);
  return await service.getCourses();
});
