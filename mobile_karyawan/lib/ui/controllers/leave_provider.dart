import 'package:flutter/material.dart';
import '../../data/services/leave_service.dart';
import '../../models/leave_model.dart';

class LeaveProvider extends ChangeNotifier {
  final LeaveService _service = LeaveService();
  List<LeaveRequest> _leaves = [];
  bool _isLoading = false;

  List<LeaveRequest> get leaves => _leaves;
  bool get isLoading => _isLoading;

  Future<void> fetchLeaves() async {
    _isLoading = true;
    notifyListeners();

    try {
      _leaves = await _service.getLeaves();
    } catch (e) {
      print("Error fetch leaves: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> applyLeave(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _service.applyLeave(data);
      if (result['id'] != null) {
        await fetchLeaves();
        return true;
      }
    } catch (e) {
      print("Error apply leave: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
