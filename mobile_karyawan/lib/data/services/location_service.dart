import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:math' show cos, sqrt, asin;
import '../../core/constants/app_constants.dart';
import '../../models/work_location_model.dart';
import 'auth_service.dart';

class LocationService {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Fetch semua lokasi kerja dari backend
  Future<List<WorkLocation>> getWorkLocations() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/locations'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        List data = jsonDecode(response.body);
        return data.map((item) => WorkLocation.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching work locations: $e');
      return [];
    }
  }

  /// Get lokasi kerja yang paling dekat dengan posisi user
  /// Returns null jika tidak ada lokasi sama sekali
  Future<WorkLocation?> getNearestLocation(double userLat, double userLon) async {
    try {
      final locations = await getWorkLocations();
      if (locations.isEmpty) return null;

      WorkLocation? nearest;
      double nearestDist = double.infinity;

      for (final loc in locations) {
        final dist = calculateDistance(userLat, userLon, loc.latitude, loc.longitude);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = loc;
        }
      }
      return nearest;
    } catch (e) {
      print('Error getting nearest location: $e');
      return null;
    }
  }

  /// Cek apakah user dalam radius salah satu lokasi kerja
  /// Returns lokasi yang match, atau null jika tidak ada yang match
  Future<WorkLocation?> getMatchingLocation(double userLat, double userLon) async {
    try {
      final locations = await getWorkLocations();
      for (final loc in locations) {
        if (isWithinRadius(userLat, userLon, loc.latitude, loc.longitude, loc.radiusMeters)) {
          return loc;
        }
      }
      return null;
    } catch (e) {
      print('Error checking matching location: $e');
      return null;
    }
  }

  /// Legacy — kept for compatibility
  Future<WorkLocation?> getPrimaryLocation() async {
    try {
      final locations = await getWorkLocations();
      return locations.isNotEmpty ? locations.first : null;
    } catch (e) {
      print('Error getting primary location: $e');
      return null;
    }
  }

  Future<Position> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return Future.error('Location permissions are permanently denied, we cannot request permissions.');
    } 

    return await Geolocator.getCurrentPosition();
  }

  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295;
    var c = cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
    return 12742 * asin(sqrt(a)) * 1000; // Result in meters
  }

  bool isWithinRadius(double userLat, double userLon, double targetLat, double targetLon, int radiusMeters) {
    double distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= radiusMeters;
  }
}
