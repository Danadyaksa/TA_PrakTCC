import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:provider/provider.dart';
import 'package:mobile_karyawan/ui/controllers/attendance_provider.dart';
import 'package:mobile_karyawan/ui/controllers/auth_provider.dart';
import 'package:mobile_karyawan/ui/controllers/schedule_provider.dart';
import 'package:mobile_karyawan/data/services/location_service.dart';
import 'package:mobile_karyawan/data/services/firestore_service.dart';
import 'package:mobile_karyawan/utils/camera_image_converter.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';

class AttendanceCameraScreen extends StatefulWidget {
  final bool isCheckIn;
  const AttendanceCameraScreen({super.key, required this.isCheckIn});

  @override
  State<AttendanceCameraScreen> createState() => _AttendanceCameraScreenState();
}

class _AttendanceCameraScreenState extends State<AttendanceCameraScreen> {
  CameraController? _controller;
  CameraDescription? _camera;
  FaceDetector? _faceDetector;
  final LocationService _locationService = LocationService();
  final FirestoreService _firestoreService = FirestoreService();
  
  bool _isBusy = false;
  bool _faceDetected = false;
  String _statusText = "Posisikan wajah Anda...";
  double _livenessScore = 0.0;
  int _faceDetectionCount = 0; // Counter untuk stabilitas deteksi
  bool _isSmiling = false;
  bool _eyesOpen = false;

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
    _camera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
    );

    _controller = CameraController(
      _camera!,
      ResolutionPreset.medium,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.nv21, // Penting untuk ML Kit
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
    if (_isBusy || _camera == null) return;
    _isBusy = true;
    
    try {
      // Convert CameraImage ke InputImage
      final inputImage = CameraImageConverter.convertCameraImage(image, _camera!);
      
      if (inputImage == null) {
        _isBusy = false;
        return;
      }

      // Detect faces dengan ML Kit
      final faces = await _faceDetector!.processImage(inputImage);
      
      if (faces.isEmpty) {
        // Tidak ada wajah terdeteksi
        setState(() {
          _faceDetected = false;
          _faceDetectionCount = 0;
          _statusText = "Posisikan wajah di dalam bulatan";
          _livenessScore = 0.0;
        });
      } else {
        // Ada wajah terdeteksi
        final face = faces.first;
        final boundingBox = face.boundingBox;
        
        // Cek apakah wajah di tengah (dalam bulatan)
        // Screen center area (approximate)
        final screenWidth = image.width.toDouble();
        final screenHeight = image.height.toDouble();
        final centerX = screenWidth / 2;
        final centerY = screenHeight / 2;
        
        final faceCenterX = boundingBox.center.dx;
        final faceCenterY = boundingBox.center.dy;
        
        // Hitung jarak dari center
        final distanceFromCenter = ((faceCenterX - centerX).abs() + (faceCenterY - centerY).abs()) / 2;
        final maxDistance = screenWidth * 0.2; // 20% dari lebar layar
        
        final isInPosition = distanceFromCenter < maxDistance;
        
        if (!isInPosition) {
          setState(() {
            _faceDetected = false;
            _faceDetectionCount = 0;
            _statusText = "Posisikan wajah di tengah bulatan";
            _livenessScore = 0.0;
          });
          _isBusy = false;
          return;
        }
        
        // Cek ukuran wajah (tidak terlalu kecil/jauh)
        final faceSize = boundingBox.width * boundingBox.height;
        final minFaceSize = (screenWidth * screenHeight) * 0.08; // Minimal 8% dari layar
        
        if (faceSize < minFaceSize) {
          setState(() {
            _faceDetected = false;
            _faceDetectionCount = 0;
            _statusText = "Dekatkan wajah ke kamera";
            _livenessScore = 0.0;
          });
          _isBusy = false;
          return;
        }
        
        // Cek liveness indicators 
        final smileProbability = face.smilingProbability ?? 0.0;
        final leftEyeOpen = face.leftEyeOpenProbability ?? 0.0;
        final rightEyeOpen = face.rightEyeOpenProbability ?? 0.0;
        
        // Threshold 
        _isSmiling = smileProbability > 0.7; 
        _eyesOpen = (leftEyeOpen > 0.8 && rightEyeOpen > 0.8); 
        
        // Hitung liveness score (0.0 - 1.0)
        _livenessScore = (smileProbability * 0.4) + 
                        ((leftEyeOpen + rightEyeOpen) / 2 * 0.6); // Lebih fokus ke mata
        
        final isValid = _isSmiling && _eyesOpen && _livenessScore > 0.75;
        
        if (!isValid) {
          // Reset counter jika tidak valid
          _faceDetectionCount = 0;
          setState(() {
            _faceDetected = true;
            _statusText = !_eyesOpen 
                ? "Buka mata lebar-lebar!" 
                : !_isSmiling 
                    ? "Senyum lebih lebar!" 
                    : "Tahan posisi...";
          });
          _isBusy = false;
          return;
        }
        
        // Increment counter jika wajah stabil terdeteksi DAN valid
        _faceDetectionCount++;
        
        setState(() {
          _faceDetected = true;
          _statusText = _faceDetectionCount < 5
              ? "Pertahankan! (${_faceDetectionCount}/5)"
              : "Perfect! Mengambil foto...";
        });
        
        // Jika sudah stabil (5 frame) dan semua valid, ambil foto
        if (_faceDetectionCount >= 5) {
          await Future.delayed(const Duration(milliseconds: 300));
          if (mounted) {
            _takeAndSubmit();
          }
        }
      }
    } catch (e) {
      print('Error processing image: $e');
    }
    
    _isBusy = false;
  }

  Future<void> _takeAndSubmit() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    
    _controller?.stopImageStream();

    try {
      setState(() => _statusText = "Memvalidasi lokasi...");
      print('🚀 START: _takeAndSubmit');
      
      // Get user data
      final user = context.read<AuthProvider>().user;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      final pos = await _locationService.getCurrentLocation();
      
      setState(() => _statusText = "Memeriksa radius...");
      // Cek apakah user dalam radius salah satu lokasi kerja
      final matchedLocation = await _locationService.getMatchingLocation(
        pos.latitude,
        pos.longitude,
      );

      if (matchedLocation == null) {
        // Tidak ada lokasi yang match — tampilkan nama lokasi terdekat
        final nearest = await _locationService.getNearestLocation(pos.latitude, pos.longitude);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                nearest != null
                  ? 'Anda di luar radius lokasi kerja. Terdekat: ${nearest.name}'
                  : 'Anda di luar radius semua lokasi kerja!',
              ),
            ),
          );
          Navigator.pop(context);
        }
        return;
      }

      final bool inRadius = true; // sudah pasti dalam radius karena matchedLocation != null
      final workLocation = matchedLocation;

      setState(() => _statusText = "Mengambil foto...");
      final image = await _controller!.takePicture();
      
      final schedule = context.read<ScheduleProvider>().todaySchedule;
      if (schedule == null && widget.isCheckIn) {
        throw Exception('Jadwal hari ini tidak ditemukan');
      }

      setState(() => _statusText = "Menyimpan presensi...");
      
      if (widget.isCheckIn) {
        await context.read<AttendanceProvider>().checkIn({
          'schedule_id': schedule!.id,
          'latitude': pos.latitude,
          'longitude': pos.longitude,
          'selfie_url': image.path,
          'liveness_score': _livenessScore
        });
      } else {
        await context.read<AttendanceProvider>().checkOut({
          'latitude': pos.latitude,
          'longitude': pos.longitude,
          'selfie_url': image.path,
          'liveness_score': _livenessScore
        });
      }
      
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${widget.isCheckIn ? "Check-in" : "Check-out"} berhasil!')),
        );
      }
      
      // Firestore logs (async di background)
      try {
        _firestoreService.logGPS(
          userId: user.id,
          latitude: pos.latitude,
          longitude: pos.longitude,
          isInRadius: inRadius,
          type: widget.isCheckIn ? 'check-in' : 'check-out',
        );
        
        _firestoreService.logSelfie(
          userId: user.id,
          isFaceDetected: _faceDetected,
          livenessScore: _livenessScore,
          status: _faceDetected && _livenessScore > 0.7 ? 'passed' : 'failed',
          photoUrl: image.path,
        );
        
        _firestoreService.logFaceValidation(
          userId: user.id,
          faceDetected: _faceDetected,
          livenessScore: _livenessScore,
          smileDetected: _isSmiling,
          eyesOpen: _eyesOpen,
          validationResult: _faceDetected && _livenessScore > 0.7 ? 'passed' : 'failed',
        );
      } catch (firestoreError) {
        print('⚠️ Firestore log error (non-critical): $firestoreError');
      }
      
    } catch (e) {
      print("❌ ERROR: $e");
      
      if (mounted) {
        final msg = e.toString().replaceFirst('Exception: ', '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: Colors.red.shade700,
            duration: const Duration(seconds: 4),
          ),
        );
        Navigator.pop(context);
      }
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
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera Preview (Full Screen tanpa distorsi)
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _controller!.value.previewSize!.height,
              height: _controller!.value.previewSize!.width,
              child: CameraPreview(_controller!),
            ),
          ),
          
          // Overlay Bingkai Wajah
          Center(
            child: Container(
              width: 280,
              height: 350,
              decoration: BoxDecoration(
                border: Border.all(
                  color: _faceDetected && _livenessScore > 0.6 
                      ? Colors.green 
                      : _faceDetected 
                          ? Colors.orange 
                          : Colors.white, 
                  width: 3
                ),
                borderRadius: BorderRadius.circular(150),
              ),
            ),
          ),
          
          // Status Text
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _statusText,
                      style: const TextStyle(
                        color: Colors.white, 
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (_faceDetected) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _eyesOpen ? Icons.visibility : Icons.visibility_off,
                            color: _eyesOpen ? Colors.green : Colors.red,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _eyesOpen ? 'Mata Terbuka' : 'Buka Mata',
                            style: TextStyle(
                              color: _eyesOpen ? Colors.green : Colors.red,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Icon(
                            _isSmiling ? Icons.sentiment_satisfied : Icons.sentiment_neutral,
                            color: _isSmiling ? Colors.green : Colors.orange,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isSmiling ? 'Senyum' : 'Mohon Senyum',
                            style: TextStyle(
                              color: _isSmiling ? Colors.green : Colors.orange,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          
          // Close Button
          Positioned(
            top: 40,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white, size: 32),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          
          // Title
          Positioned(
            top: 50,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  widget.isCheckIn ? 'CHECK-IN' : 'CHECK-OUT',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
