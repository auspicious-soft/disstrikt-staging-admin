import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { BASE_IMG_URL } from "@/constants/apiUrls";
import dummyImgInTable from "../../../../assets/images/dummyImageInUsers.png";

type ImageSrc = string | StaticImageData;

interface ImagesTabProps {
  setCards: string[];
  images: ImageSrc[];
}

const CustomImage: React.FC<{
  src: ImageSrc;
  alt: string;
  className?: string;
  width: number;
  height: number;
  quality?: number;
}> = ({ src, alt, className, width, height, quality }) => {
  const [currentSrc, setCurrentSrc] = useState<ImageSrc>(src);

  const handleError = () => {
    setCurrentSrc(dummyImgInTable);
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      quality={quality}
      onError={handleError}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

const ImagesTab: React.FC<ImagesTabProps> = ({ setCards, images }) => {
  return (
    <div className="flex flex-col gap-6 w-full px-4">
      {setCards.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-stone-200">Set Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {setCards.map((img, idx) => (
              <div
                key={idx}
                className="w-full max-w-[300px] mx-auto aspect-square overflow-hidden rounded-[10px]"
              >
                <CustomImage
                  src={`${BASE_IMG_URL}${img}`}
                  alt={`Set Card ${idx}`}
                  className="object-cover rounded-[10px]  object-top"
                  width={300}
                  height={300}
                  quality={100}
                />
              </div>
            ))}
          </div>
        </>
      )}

      
<h2 className="text-lg font-bold text-stone-200">Images</h2>
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => {
            const imgSrc =
              typeof img === "string" ? `${BASE_IMG_URL}${img}` : img;
            return (
              <div
                key={idx}
                className="w-full max-w-[300px] mx-auto aspect-square overflow-hidden rounded-[10px]"
              >
                <CustomImage
                  src={imgSrc}
                  alt={`Image ${idx}`}
                  className="object-cover rounded-[10px] object-top"
                  width={300}
                  height={300}
                  quality={100}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-muted-foreground italic flex justify-center items-center ">No images available</p>
      )}
    </div>
  );
};

export default ImagesTab;