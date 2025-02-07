import { classType } from "@/App";
import { Canvas, Polygon } from "fabric";
import { toast } from "sonner";

interface CocoAnnotation {
  id: number;
  image_id: number;
  category_id: number;
  segmentation: number[][];
  area: number;
  bbox: number[];
  iscrowd: number;
}

export function exportCOCO(canvas: Canvas, classes: classType[], image: File) {
  if (!canvas) {
    toast("No canvas to export");
    return;
  }

  const objects = canvas.getObjects();
  if (objects.length === 0) {
    toast("No annotations to export");
    return;
  }

  const imageId = 1;
  const coco: {
    images: { id: number; file_name: string; width: number; height: number }[];
    annotations: CocoAnnotation[];
    categories: { id: number; name: string }[];
  } = {
    images: [
      {
        id: imageId,
        file_name: image.name,
        width: canvas.width!,
        height: canvas.height!,
      },
    ],
    annotations: [],
    categories: classes.map((cls, index) => ({
      id: index + 1,
      name: cls.label,
    })),
  };

  let annotationId = 1;
  objects.forEach((obj) => {
    if (obj.type === "polygon" && "points" in obj) {
      const polygon = obj as Polygon;
      const segmentation = polygon.points.map((point) => [point.x, point.y]).flat();

      const bbox = [
        Math.min(...segmentation.filter((_, i: number) => i % 2 === 0)),
        Math.min(...segmentation.filter((_, i: number) => i % 2 !== 0)),
        Math.max(...segmentation.filter((_, i: number) => i % 2 === 0)) -
        Math.min(...segmentation.filter((_, i: number) => i % 2 === 0)),
        Math.max(...segmentation.filter((_, i: number) => i % 2 !== 0)) -
        Math.min(...segmentation.filter((_, i: number) => i % 2 !== 0)),
      ];

      const category = classes.find(cls => cls.color === obj.fill);

      coco.annotations.push({
        id: annotationId++,
        image_id: imageId,
        category_id: category ? classes.indexOf(category) + 1 : 1,
        segmentation: [segmentation],
        area: bbox[2] * bbox[3],
        bbox: bbox,
        iscrowd: 0,
      });
    }
  });

  const blob = new Blob([JSON.stringify(coco, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "annotations.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
