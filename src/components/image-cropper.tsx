
'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Ban, RotateCw, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Utility to create an image element
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

// Utility to get cropped image data as a PNG data URI
async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const rotRad = rotation * Math.PI / 180;
    
    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotation and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);
    
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);


    return canvas.toDataURL('image/png');
}

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = Math.abs(rotation) * Math.PI / 180;

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

interface ImageCropperProps {
    images: string[];
    onComplete: (croppedImageUris: string[]) => void;
    onCancel: () => void;
}

export function ImageCropper({ images, onComplete, onCancel }: ImageCropperProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1); // Start at minimum zoom
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImages, setCroppedImages] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .reactEasyCrop_Container {
                height: 100% !important;
                width: 100% !important;
                position: relative !important;
                overflow: hidden !important;
            }
            .reactEasyCrop_CropArea {
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
                height: 100% !important;
            }
            .reactEasyCrop_Media,
            .reactEasyCrop_Image {
                object-fit: contain !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        // Reset zoom and crop when image changes
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setImageSize(null);
    }, [currentIndex]);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropChange = useCallback((newCrop: Point) => {
        // Let restrictPosition handle the bounds checking
        // This handler just passes through to ensure smooth interaction
        setCrop(newCrop);
    }, []);

    const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
        setImageSize(mediaSize);
        // Keep zoom at minimum (1) - user can zoom in if needed
        // This allows panning to reveal more of the image
    }, []);

    const handleNext = async () => {
        if (!croppedAreaPixels || !images[currentIndex]) return;
        
        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(images[currentIndex], croppedAreaPixels, rotation);
            const newCroppedImages = [...croppedImages, croppedImage];
            setCroppedImages(newCroppedImages);
            
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            } else {
                onComplete(newCroppedImages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFinish = async () => {
        setIsProcessing(true);
        try {
            if (croppedImages.length < images.length) {
                if (!croppedAreaPixels || !images[currentIndex]) return;
                const croppedImage = await getCroppedImg(images[currentIndex], croppedAreaPixels, rotation);
                onComplete([...croppedImages, croppedImage]);
            } else {
                onComplete(croppedImages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    }

    const PAPER_ASPECT = 8.5 / 11;

    return (
        <Card className="w-full max-w-2xl mx-auto bg-[#1a0d2e]/90 border-purple-900">
            <CardHeader>
                <CardTitle className="text-white">Crop Your Images (Step {currentIndex + 1} of {images.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
                 <div className="relative w-full max-w-[314px] sm:max-w-md mx-auto bg-muted rounded-lg overflow-hidden">
                    <div style={{ paddingTop: `${(11 / 8.5) * 100}%`, position: 'relative', width: '100%' }}>
                        {images[currentIndex] && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                <Cropper
                                    image={images[currentIndex]}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={PAPER_ASPECT}
                                    onCropChange={handleCropChange}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    onMediaLoaded={onMediaLoaded}
                                    restrictPosition={false}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4 mt-4 px-4 sm:px-0">
                     <div className="grid grid-cols-1 gap-4 items-center">
                        <div className="space-y-2">
                            <label htmlFor="zoom" className="block text-sm font-medium text-purple-200">Zoom</label>
                            <Slider
                                id="zoom"
                                min={1}
                                max={3}
                                step={0.1}
                                value={[zoom]}
                                onValueChange={(value) => setZoom(value[0])}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-4 sm:p-6 sm:pt-0">
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="w-1/2 sm:w-auto">
                        <Ban className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button variant="outline" onClick={() => setRotation(r => (r + 90) % 360)} className="w-1/2 sm:w-auto">
                        <RotateCw className="mr-2 h-4 w-4" />
                        Rotate
                    </Button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {currentIndex < images.length -1 && (
                        <Button onClick={handleNext} disabled={isProcessing} className="w-1/2 sm:w-auto">
                             {isProcessing ? 'Processing...' : `Next Image (${currentIndex + 2}/${images.length})`}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    <Button onClick={handleFinish} disabled={isProcessing} className={currentIndex < images.length - 1 ? "w-1/2 sm:w-auto" : "w-full sm:w-auto"}>
                        <Check className="mr-2 h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Finish'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
