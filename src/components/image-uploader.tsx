
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
    const [isAddingMorePhotos, setIsAddingMorePhotos] = useState(false);

    const difficultyLabels: Record<number, string> = {
        1: 'Very Easy',
        2: 'Easy',
        3: 'Normal',
        4: 'Difficult',
        5: 'Very Difficult',
    };

    // Example images for difficulty preview (you'll provide these)
    const difficultyExamples = {
        original: '/examples/original.jpg',
        1: '/examples/very-easy.jpg',
        2: '/examples/easy.jpg', 
        3: '/examples/normal.jpg',
        4: '/examples/difficult.jpg',
        5: '/examples/very-difficult.jpg'
    };

    const { toast } = useToast();

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
        setIsAddingMorePhotos(false);
    }

    const handleAddMorePhotos = () => {
        setIsAddingMorePhotos(true);
        setFiles([]);
    }
    
    const handleCroppingComplete = async (croppedImageUris: string[]) => {
        setIsSubmitting(true);
        setCroppingStep(false);

        try {
            toast({ title: "Let the magic begin...", description: `Our AI is converting your ${croppedImageUris.length} photos. This might take a moment.` });
            
            const { coloringBookDataUris } = await generateColoringBookImages({ photoDataUris: croppedImageUris, style, difficulty });

            if (!coloringBookDataUris || coloringBookDataUris.length !== croppedImageUris.length) {
                throw new Error("The AI did not return the expected number of images.");
            }

            const newConvertedImages = croppedImageUris.map((originalUri, index) => ({
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
    
    return (
        <Card>
            <CardContent className="p-6">
                <div
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
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
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                            <span className="font-semibold text-primary">
                                {isAddingMorePhotos ? "Click to add more photos" : "Click to upload photos"}
                            </span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, HEIC, etc.</p>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-4">
                            {isAddingMorePhotos ? "Additional Photos" : "Your Photos"} ({files.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {files.map((uploadedFile, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image
                                        src={uploadedFile.preview}
                                        alt={uploadedFile.file.name}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-background/70 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <div className="flex items-center space-x-2">
                            <Switch id="realistic-style" checked={style === 'realistic'} onCheckedChange={(checked) => setStyle(checked ? 'realistic' : 'outline')} />
                            <Label htmlFor="realistic-style">Realistic Style</Label>
                        </div>
                        <div className="grid gap-2 w-full max-w-sm">
                             <div className="flex justify-between items-center">
                                <Label htmlFor="difficulty-slider">Difficulty: {difficultyLabels[difficulty]}</Label>
                                <span className='text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md'>{difficulty}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">Very Easy</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex-1">
                                                <Slider
                                                    id="difficulty-slider"
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    value={[difficulty]}
                                                    onValueChange={(value) => setDifficulty(value[0])}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="p-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm text-center">{difficultyLabels[difficulty]} ({difficulty})</h4>
                                                <div className="flex gap-2">
                                                    <div className="text-center">
                                                        <div className="aspect-[8.5/11] w-20 bg-gray-100 rounded mb-1 overflow-hidden">
                                                            <Image
                                                                src={difficultyExamples.original}
                                                                alt="Original"
                                                                width={80}
                                                                height={103}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-xs">Original</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="aspect-[8.5/11] w-20 bg-gray-100 rounded mb-1 overflow-hidden">
                                                            <Image
                                                                src={difficultyExamples[difficulty as keyof typeof difficultyExamples]}
                                                                alt={difficultyLabels[difficulty]}
                                                                width={80}
                                                                height={103}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-xs">{difficultyLabels[difficulty]}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span className="text-sm text-muted-foreground">Very Difficult</span>
                            </div>
                        </div>
                    </div>
                    <div className={`flex ${isAddingMorePhotos ? 'justify-between' : 'justify-end'}`}>
                        {isAddingMorePhotos && (
                            <Button onClick={() => setIsAddingMorePhotos(false)} variant="outline" size="lg">
                                Cancel
                            </Button>
                        )}
                         <Button onClick={() => setCroppingStep(true)} disabled={isButtonDisabled} size="lg">
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
