
"use client";

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateColoringBookImages, GenerateColoringBookImagesInput } from '@/ai/flows/generate-coloring-book-images';
import { Button } from './ui/button';
import { UploadCloud, X, Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ImagePreviewGrid } from './image-preview-grid';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { ImageCropper } from './image-cropper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Checkbox } from './ui/checkbox';
import Link from 'next/link';

interface UploadedFile {
    file: File;
    preview: string;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error("Couldn't read file"));
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};


export function ImageUploader() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [convertedImages, setConvertedImages] = useState<{original: string, converted: string}[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [style, setStyle] = useState<GenerateColoringBookImagesInput['style']>('outline');
    const [difficulty, setDifficulty] = useState(3);
    const [croppingStep, setCroppingStep] = useState(false);
    const [termsStep, setTermsStep] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [pendingCroppedImages, setPendingCroppedImages] = useState<string[]>([]);
    const [isAddingMorePhotos, setIsAddingMorePhotos] = useState(false);
    const [showDifficultyTooltip, setShowDifficultyTooltip] = useState(false); // Tooltip state

    const difficultyLabels: Record<number, string> = {
        1: 'Very Simple',
        2: 'Simple',
        3: 'Normal',
        4: 'Detailed',
        5: 'Very Detailed',
    };

    // Example images for difficulty preview (you'll provide these)
    const difficultyExamples = {
        original: '/examples/original.png',
        1: '/examples/very-easy.png',
        2: '/examples/easy.png',
        3: '/examples/normal.png',
        4: '/examples/difficult.png',
        5: '/examples/very-difficult.png'
    };

    const { toast } = useToast();

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showDifficultyTooltip) {
                const target = event.target as Element;
                if (!target.closest('.difficulty-tooltip-container')) {
                    setShowDifficultyTooltip(false);
                }
            }
        };

        if (showDifficultyTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDifficultyTooltip]);

    const handleFiles = useCallback(async (incomingFiles: FileList | null) => {
        if (!incomingFiles) return;
        
        const newFiles = Array.from(incomingFiles)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                file: file,
                preview: URL.createObjectURL(file)
            }));
        
        setFiles(prev => [...prev, ...newFiles]);

    }, []);

    useEffect(() => {
        // Cleanup object URLs to prevent memory leaks
        return () => {
            files.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [files]);

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };



    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            const fileToRemove = newFiles[index];
            if(fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleReset = () => {
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
        setConvertedImages([]);
        setIsSubmitting(false);
        setCroppingStep(false);
        setTermsStep(false);
        setAgreedToTerms(false);
        setAgreedToPrivacy(false);
        setPendingCroppedImages([]);
        setIsAddingMorePhotos(false);
    }

    const handleAddMorePhotos = () => {
        setIsAddingMorePhotos(true);
        setFiles([]);
    }
    
    const handleCroppingComplete = (croppedImageUris: string[]) => {
        setPendingCroppedImages(croppedImageUris);
        setCroppingStep(false);
        // Only show terms step if it's the first time (not adding more photos)
        if (!isAddingMorePhotos) {
            setTermsStep(true);
        } else {
            // If adding more photos, skip terms and go straight to generation
            handleTermsAcceptance(croppedImageUris);
        }
    }

    const handleTermsAcceptance = async (croppedImageUris?: string[]) => {
        if (!agreedToTerms || !agreedToPrivacy) {
            toast({ title: "Acceptance Required", description: "Please accept both the Terms of Service and Privacy Policy to continue.", variant: 'destructive' });
            return;
        }

        const imagesToProcess = croppedImageUris || pendingCroppedImages;
        setIsSubmitting(true);
        setTermsStep(false);
        setAgreedToTerms(false);
        setAgreedToPrivacy(false);

        try {
            toast({ title: "Let the magic begin...", description: `Our AI is converting your ${imagesToProcess.length} photos. This might take a moment.` });
            
            const { coloringBookDataUris } = await generateColoringBookImages({ photoDataUris: imagesToProcess, style, difficulty });

            if (!coloringBookDataUris || coloringBookDataUris.length !== imagesToProcess.length) {
                throw new Error("The AI did not return the expected number of images.");
            }

            const newConvertedImages = imagesToProcess.map((originalUri, index) => ({
                original: originalUri,
                converted: coloringBookDataUris[index]
            }));

            if (isAddingMorePhotos) {
                // Add new images to existing ones
                setConvertedImages(prev => [...prev, ...newConvertedImages]);
                toast({ title: "Photos Added!", description: `${newConvertedImages.length} new images have been added to your coloring book.` });
                setIsAddingMorePhotos(false);
            } else {
                // Replace all images (first time)
                setConvertedImages(newConvertedImages);
                toast({ title: "Coloring Book Created!", description: "Your images have been converted into a coloring book." });
            }
            setFiles([]);
            setPendingCroppedImages([]);

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Could not create your coloring pages. Please try again.";
            toast({ title: "An error occurred", description: errorMessage, variant: 'destructive' });
            // If it fails, let the user try again from the start.
            handleReset();
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const isButtonDisabled = isSubmitting || files.length === 0;

    if (isSubmitting) {
        return (
            <Card className="bg-[#1a0d2e]/90 border-purple-900">
                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 text-purple-300 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {isAddingMorePhotos ? "Adding Photos..." : "Creating Your Coloring Book"}
                    </h3>
                    <p className="text-purple-200 text-center max-w-md">
                        Our AI is converting your photos into coloring pages. This might take a moment...
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (convertedImages.length > 0 && !isAddingMorePhotos) {
        return (
            <div>
                <ImagePreviewGrid 
                    images={convertedImages} 
                    style={style} 
                    difficulty={difficulty} 
                    onStartOver={handleReset}
                    onAddMorePhotos={handleAddMorePhotos}
                />
            </div>
        )
    }

    if (croppingStep) {
        return <ImageCropper images={files.map(f => f.preview)} onComplete={handleCroppingComplete} onCancel={() => setCroppingStep(false)} />
    }

    if (termsStep) {
        return (
            <Card className="bg-[#1a0d2e]/90 border-purple-900">
                <CardContent className="p-6 sm:p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Terms of Service & Privacy Policy</h2>
                    <p className="text-purple-200 mb-6">
                        Before we create your coloring book, please review and accept our Terms of Service and Privacy Policy.
                    </p>
                    
                    <div className="space-y-6 sm:space-y-4 mb-8">
                        <div className="flex items-start space-x-3 sm:space-x-3">
                            <Checkbox 
                                id="terms" 
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                                className="mt-1"
                            />
                            <Label htmlFor="terms" className="text-purple-200 cursor-pointer leading-relaxed">
                                I have read and agree to the{' '}
                                <Link href="/terms" target="_blank" className="text-purple-300 hover:text-purple-100 underline">
                                    Terms of Service
                                </Link>
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3 sm:space-x-3">
                            <Checkbox 
                                id="privacy" 
                                checked={agreedToPrivacy}
                                onCheckedChange={(checked) => setAgreedToPrivacy(checked === true)}
                                className="mt-1"
                            />
                            <Label htmlFor="privacy" className="text-purple-200 cursor-pointer leading-relaxed">
                                I have read and agree to the{' '}
                                <Link href="/privacy" target="_blank" className="text-purple-300 hover:text-purple-100 underline">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setTermsStep(false);
                                setCroppingStep(true);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Back
                        </Button>
                        <Button 
                            onClick={() => handleTermsAcceptance()}
                            disabled={!agreedToTerms || !agreedToPrivacy}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            Agree & Create Coloring Book
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="bg-[#1a0d2e]/90 border-purple-900">
            <CardContent className="p-6">
                <div
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
                    ${isDragging ? 'border-purple-300 bg-purple-700/30' : 'border-purple-600'}`}
                >
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <UploadCloud className="mx-auto h-12 w-12 text-purple-200" />
                        <p className="mt-4 text-purple-100">
                            <span className="font-semibold text-purple-200">
                                {isAddingMorePhotos ? "Click to add more photos" : "Click to upload photos"}
                            </span> or drag and drop
                        </p>
                        <p className="text-xs text-purple-300">PNG, JPG, HEIC, etc.</p>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-4 text-white">
                            {isAddingMorePhotos ? "Additional Photos" : "Your Photos"} ({files.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {files.map((uploadedFile, index) => (
                                <div key={index} className="relative group" style={{aspectRatio: '8.5 / 11'}}>
                                    <Image
                                        src={uploadedFile.preview}
                                        alt={uploadedFile.file.name}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-purple-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-8 flex flex-col gap-6">
                    <div className='flex flex-col sm:flex-row gap-6 sm:gap-8'>
                        {/* <div className="flex items-center space-x-2">
                            <Switch id="realistic-style" checked={style === 'realistic'} onCheckedChange={(checked) => setStyle(checked ? 'realistic' : 'outline')} />
                            <Label htmlFor="realistic-style">Realistic Style</Label>
                        </div> */}
                        <div className="grid gap-2 w-full max-w-sm">
                             <div className="flex justify-between items-center">
                                <Label htmlFor="difficulty-slider" className="text-white">Level of Detail: {difficultyLabels[difficulty]}</Label>
                                <span className='text-sm font-medium text-purple-200 bg-purple-700/50 px-2 py-1 rounded-md'>{difficulty}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-purple-200">Very Simple</span>
                                <div className="flex-1 relative difficulty-tooltip-container">
                                    <Slider
                                        id="difficulty-slider"
                                        min={1}
                                        max={5}
                                        step={1}
                                        value={[difficulty]}
                                        onValueChange={(value) => setDifficulty(value[0])}
                                        onMouseDown={() => setShowDifficultyTooltip(true)}
                                        onMouseEnter={() => setShowDifficultyTooltip(true)}
                                        onTouchStart={() => setShowDifficultyTooltip(true)}
                                    />
                                    
                                    {/* Custom Tooltip */}
                                    {showDifficultyTooltip && (
                                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                                            <div className="bg-popover border rounded-lg shadow-lg p-6 sm:p-8 max-w-none w-auto">
                                                <div className="space-y-4 sm:space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-semibold text-lg sm:text-xl">Example: {difficultyLabels[difficulty]} ({difficulty})</h4>
                                                        <button
                                                            onClick={() => setShowDifficultyTooltip(false)}
                                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                                            aria-label="Close tooltip"
                                                        >
                                                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="text-center">
                                                        <div className="relative aspect-[8.5/11] w-72 sm:w-96 bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-md mx-auto">
                                                            {/* Coloring book image - full size background */}
                                                            <div className="absolute inset-0">
                                                                <Image
                                                                    src={`${difficultyExamples[difficulty as keyof typeof difficultyExamples]}?v=${Date.now()}`}
                                                                    alt={difficultyLabels[difficulty]}
                                                                    width={432}
                                                                    height={560}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            {/* Original image - left half overlay with higher z-index */}
                                                            <div className="absolute inset-0 overflow-hidden z-10" style={{clipPath: 'inset(0 50% 0 0)'}}>
                                                                <Image
                                                                    src={`${difficultyExamples.original}?v=${Date.now()}`}
                                                                    alt="Original"
                                                                    width={432}
                                                                    height={560}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-xs sm:text-sm font-medium">
                                                            <span>Original</span>
                                                            <span>{difficultyLabels[difficulty]}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Mobile-only slider inside tooltip */}
                                                    <div className="flex items-center gap-4 sm:hidden">
                                                        <span className="text-sm text-muted-foreground">Very Simple</span>
                                                        <div className="flex-1">
                                                            <Slider
                                                                id="difficulty-slider-tooltip"
                                                                min={1}
                                                                max={5}
                                                                step={1}
                                                                value={[difficulty]}
                                                                onValueChange={(value) => setDifficulty(value[0])}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">Very Detailed</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm text-purple-200">Very Detailed</span>
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-col sm:flex-row ${isAddingMorePhotos ? 'sm:justify-between' : 'sm:justify-end'} gap-2`}>
                        {isAddingMorePhotos && (
                            <Button onClick={() => setIsAddingMorePhotos(false)} variant="outline" size="lg" className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        )}
                         <Button onClick={() => setCroppingStep(true)} disabled={isButtonDisabled} size="lg" className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isAddingMorePhotos ? "Adding Photos..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    {isAddingMorePhotos ? "Add to Coloring Book" : "Create Coloring Book"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
