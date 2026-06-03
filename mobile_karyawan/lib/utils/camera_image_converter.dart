import 'dart:ui';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

/// Utility untuk convert CameraImage ke InputImage untuk ML Kit
class CameraImageConverter {
  static InputImage? convertCameraImage(CameraImage image, CameraDescription camera) {
    try {
      // Get image rotation
      final sensorOrientation = camera.sensorOrientation;
      InputImageRotation? rotation;
      
      if (camera.lensDirection == CameraLensDirection.front) {
        rotation = InputImageRotation.rotation270deg;
      } else {
        rotation = InputImageRotation.rotation90deg;
      }

      // Get image format
      final format = InputImageFormatValue.fromRawValue(image.format.raw);
      if (format == null) return null;

      // Get plane data
      if (image.planes.isEmpty) return null;
      
      final plane = image.planes.first;
      
      // Create InputImage
      return InputImage.fromBytes(
        bytes: plane.bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: format,
          bytesPerRow: plane.bytesPerRow,
        ),
      );
    } catch (e) {
      print('Error converting camera image: $e');
      return null;
    }
  }
}
