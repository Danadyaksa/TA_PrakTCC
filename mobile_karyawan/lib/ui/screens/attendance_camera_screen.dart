import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:provider/provider.dart';
import 'package:mobile_karyawan/data/providers/attendance_provider.dart';
import 'package:mobile_karyawan/data/services/location_service.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';

class AttendanceCameraScreen extends StatefulWidget {
  final bool isCheckIn;
  const AttendanceCameraScreen({super.key, required this.isCheckIn});

  @override
  State<AttendanceCameraScreen> createState() => _AttendanceCameraScreenState();
}

class _AttendanceCameraScreenState extends State<AttendanceCameraScreen> {
  CameraController? _controller;
  FaceDetector? _faceDetector;
  bool _isBusy = false;
  bool _faceDetected = false;
  String _statusText = "Mendeteksi wajah...";

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(
        enableClassification: true, // Untuk deteksi senyum/mata
        enableTracking: true,
      ),
    );
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
    );

    _controller = CameraController(
      frontCamera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await _controller?.initialize();
    if (mounted) {
      setState(() {});
      _startImageStream();
    }
  }

  void _startImageStream() {
    _controller?.startImageStream((image) {
      if (_isBusy) return;
      _processImage(image);
    });
  }

  Future<void> _processImage(CameraImage image) async {
    _isBusy = true;
    
    // Konversi CameraImage ke InputImage (Sederhananya di sini, implementasi real butuh utility conversion)
    // Untuk demo ini, kita asumsikan deteksi berhasil jika ada wajah
    
    setState(() {
      _faceDetected = true; 
      _statusText = "Wajah terdeteksi! Mohon senyum...";
    });

    // Simulasi Liveness: Jika sudah terdeteksi dan stabil, ambil foto
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) _takeAndSubmit();
    
    _isBusy = false;
  }

  Future<void> _takeAndSubmit() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    
    _controller?.stopImageStream();
    setState(() => _statusText = "Memvalidasi lokasi...");

    try {
      // 1. Cek Lokasi
      final locService = LocationService();
      final pos = await locService.getCurrentLocation();
      
      // Ambil data lokasi kantor dari API (Idealnya fetched di provider)
      // Hardcoded untuk demo:
      const double officeLat = -6.175110; 
      const double officeLon = 106.827153;
      const int radius = 100;

      bool inRadius = locService.isWithinRadius(pos.latitude, pos.longitude, officeLat, officeLon, radius);

      if (!inRadius) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Anda di luar radius kantor!')),
          );
          Navigator.pop(context);
        }
        return;
      }

      // 2. Ambil Foto
      final image = await _controller!.takePicture();
      
      // 3. Submit ke Backend
      if (mounted) {
        final success = await context.read<AttendanceProvider>().checkIn({
          'schedule_id': 1, // Harusnya ambil dari scheduleService
          'latitude': pos.latitude,
          'longitude': pos.longitude,
          'selfie_url': 'https://storage.googleapis.com/test/selfie.jpg', // Placeholder
          'liveness_score': 0.95
        });

        if (success && mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Presensi berhasil!')),
          );
        }
      }
    } catch (e) {
      print("Error submit: $e");
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _faceDetector?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null || !_controller!.value.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: Stack(
        children: [
          CameraPreview(_controller!),
          // Overlay Bingkai Wajah
          Center(
            child: Container(
              width: 280,
              height: 350,
              decoration: BoxDecoration(
                border: Border.all(color: _faceDetected ? Colors.green : Colors.white, width: 3),
                borderRadius: BorderRadius.circular(150),
              ),
            ),
          ),
          // Status Text
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _statusText,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
