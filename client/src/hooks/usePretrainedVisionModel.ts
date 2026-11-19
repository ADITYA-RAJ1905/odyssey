import { useState, useEffect, useCallback } from 'react';
import { visionModelService, DetectionResult, ModelStatus } from '../services/visionModelService';

export function usePretrainedVisionModel() {
  const [modelState, setModelState] = useState(visionModelService.getStatus());
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);

  useEffect(() => {
    // Sync initial state and subscribe to status updates
    setModelState(visionModelService.getStatus());
    const unsubscribe = visionModelService.subscribe(() => {
      setModelState(visionModelService.getStatus());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const initModel = useCallback(async () => {
    await visionModelService.loadModel();
  }, []);

  const runDetection = useCallback(async (
    imageSource: string | HTMLImageElement | HTMLCanvasElement,
    threshold: number = 0.5,
    sampleKey?: string
  ) => {
    setIsDetecting(true);
    try {
      const results = await visionModelService.detect(imageSource, threshold, sampleKey);
      setDetections(results);
      return results;
    } catch (err) {
      console.error('Detection failed:', err);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    status: modelState.status,
    progress: modelState.progress,
    statusMessage: modelState.statusMessage,
    isUsingFallback: modelState.isUsingFallback,
    modelName: modelState.modelName,
    isDetecting,
    detections,
    initModel,
    runDetection
  };
}
