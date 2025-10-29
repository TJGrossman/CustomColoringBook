
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Printer, X, Copy, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { regenerateIndividualImage } from '@/ai/flows/regenerate-individual-image';
import { GenerateColoringBookImagesInput } from '@/ai/flows/generate-coloring-book-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { copyToClipboard } from '@/lib/clipboard';


type ImagePreviewGridProps = {
    images: {original: string, converted: string}[];
    style: GenerateColoringBookImagesInput['style'];
    difficulty: number;
    onStartOver: () => void;
    onAddMorePhotos: () => void;
};

export function ImagePreviewGrid({ images: initialImages, style, difficulty, onStartOver, onAddMorePhotos }: ImagePreviewGridProps) {
    const [images, setImages] = useState(initialImages);
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [userNotes, setUserNotes] = useState("");

    const { toast } = useToast();


    const handleRegenerate = async (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: true }));
        const imageToRegen = images[index];
        
        if (!imageToRegen) {
            toast({ title: "Error", description: "Image not found.", variant: 'destructive' });
            setLoadingStates(prev => ({ ...prev, [index]: false }));
            return;
        }

        try {
            toast({ title: "Regenerating...", description: "Our AI is creating a new version of your image." });
            const { regeneratedPhotoDataUri } = await regenerateIndividualImage({ 
                photoDataUri: imageToRegen.original, 
                style, 
                difficulty,
                userNotes,
             });
            
            setImages(prevImages => 
                prevImages.map((img, i) => 
                    i === index ? { ...img, converted: regeneratedPhotoDataUri } : img
                )
            );
            toast({ title: "Image Regenerated!", description: "A new version of your image has been created." });
            setUserNotes("");

        } catch (error) {
            console.error(error);
            toast({ title: "Regeneration Failed", description: "Could not regenerate the image. Please try again.", variant: 'destructive' });
        } finally {
            setLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Coloring Book</title>');
            printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } img { max-width: 100%; height: auto; page-break-inside: avoid; } }</style>');
            printWindow.document.write('</head><body>');
            images.forEach(image => {
                printWindow.document.write(`<img src="${image.converted}" />`);
            });
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { // Timeout to ensure images load
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    }

    const handleCopyImageUrl = async (imageUrl: string) => {
        const success = await copyToClipboard(imageUrl);
        if (success) {
            toast({
                title: "Copied!",
                description: "Image URL copied to clipboard."
            });
        } else {
            toast({
                title: "Copy Failed",
                description: "Could not copy to clipboard. Your browser may not support this feature.",
                variant: 'destructive'
            });
        }
    }

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-center sm:text-left">Your Coloring Book Preview</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                     <Button onClick={onStartOver} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                    <Button onClick={onAddMorePhotos} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add More Photos
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Download Book
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                    <Card key={index} className="group overflow-hidden cursor-pointer" onClick={() => setPreviewIndex(index)}>
                        <CardContent className="p-0">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={image.converted}
                                    alt={`Coloring page ${index + 1}`}
                                    fill
                                    className="object-cover bg-white"
                                />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden">
                                    <span className="text-white font-bold">View</span>
                                 </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={previewIndex !== null} onOpenChange={(isOpen) => !isOpen && setPreviewIndex(null)}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 bg-secondary flex flex-col justify-center items-center">
                    <DialogTitle className="sr-only">Coloring Book Preview</DialogTitle>
                    {previewIndex !== null && (
                        <Carousel 
                            opts={{ startIndex: previewIndex, loop: true }} 
                            className="w-full h-full"
                        >
                            <CarouselContent className="h-full">
                                {images.map((image, index) => (
                                    <CarouselItem key={index} className="h-full flex flex-col items-center justify-start p-2 sm:p-4">
                                        <div className="text-center mb-2">
                                            <p className="text-sm sm:text-lg font-semibold">Page {index + 1} of {images.length}</p>
                                        </div>
                                        <div className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-[8.5/11] shadow-lg rounded-md overflow-hidden bg-white mx-auto flex-shrink-0">
                                            <Image
                                                src={image.converted}
                                                alt={`Coloring page ${index + 1}`}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-sm px-2">
                                             <div className="grid w-full gap-1">
                                                <Label htmlFor="notes" className="text-xs sm:text-sm">Regeneration Notes (Optional)</Label>
                                                <Textarea 
                                                    id="notes" 
                                                    placeholder="e.g., 'make lines thicker'" 
                                                    value={userNotes}
                                                    onChange={(e) => setUserNotes(e.target.value)}
                                                    className="min-h-[50px] text-xs sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRegenerate(index)}
                                                    disabled={loadingStates[index]}
                                                    className="flex-1 text-xs sm:text-sm"
                                                >
                                                    {loadingStates[index] ? (
                                                        <>
                                                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                            <span className="hidden sm:inline">Working...</span>
                                                            <span className="sm:hidden">...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                            <span className="hidden sm:inline">Regenerate</span>
                                                            <span className="sm:hidden">Regen</span>
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopyImageUrl(image.converted)}
                                                    className="px-2 sm:px-3"
                                                >
                                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

    