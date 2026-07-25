import type {
  EditableImage,
  TransformationItem,
} from "../types";

export const getEditableImagePreviewSource = (
  image: EditableImage,
  createObjectUrl: (file: File) => string = URL.createObjectURL,
): string => {
  if (image.file) return createObjectUrl(image.file);
  return image.url ?? "";
};

export const applyUploadedGalleryPath = (
  images: EditableImage[],
  index: number,
  path: string,
): EditableImage[] => {
  return images.map((image, imageIndex) =>
    imageIndex === index ? { ...image, url: path } : image,
  );
};

export const applyUploadedTransformationPath = (
  transformations: TransformationItem[],
  id: string,
  path: string,
): TransformationItem[] => {
  return transformations.map((transformation) =>
    transformation.id === id
      ? { ...transformation, uploadedPath: path }
      : transformation,
  );
};

export const getTransformationSubmissionImage = (
  transformation: TransformationItem,
): string | File => {
  return transformation.uploadedPath ?? transformation.image;
};
