import { useEffect, useRef, useState } from 'react';
import './App.css'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button';
import { Brush, Eraser, Move, PenLine, PlusCircle, SquareDashed, Trash, Undo } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Separator } from './components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet';
import { toast } from 'sonner';
import { Canvas, controlsUtils, FabricImage, PencilBrush, Polygon } from 'fabric';

export type classType = {
  label: string; color: string
}

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState<Canvas>();
  const [image, setImage] = useState<File | null>(null);
  const [tool, setTool] = useState<'move' | 'brush' | 'polygon' | 'eraser'>('move');
  const [manageClasses, setManageClasses] = useState<boolean>(false);
  const [classes, setClasses] = useState<classType[]>([]);
  const [currentClass, setCurrentClass] = useState<classType>();
  const [newClass, setNewClass] = useState<classType>({ label: '', color: '' });
  const [brushWidth, setBrushWidth] = useState<number>(15);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showBrushWidth, setShowBrushWidth] = useState<boolean>(false);

  function saveHistory() {
    if (canvas) {
      const json = canvas.toJSON();
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), JSON.stringify(json)]);
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }

  function undoLast() {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      canvas?.loadFromJSON(previousState, () => {
        canvas.renderAll();
        setHistoryIndex(historyIndex - 1);
      });
    }
  }

  function addClass(newClass: { label: string; color: string }) {
    if (classes.find(item => item.color === newClass.color)) {
      toast("Class with the same color already exists");
    } else {
      setClasses([...classes, newClass]);
      setNewClass({ label: '', color: '' });
    }
  }

  function removeClass(index: number) {
    setClasses(classes.filter((_, i) => i !== index));
  }

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: (window.innerWidth * 0.8),
        height: window.innerWidth > 768 ? window.innerHeight : (window.innerHeight * 0.6),
      });

      initCanvas.backgroundColor = '#f0f0f0';
      initCanvas.renderAll();

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      }
    }
  }, [])

  useEffect(() => {
    if (image && canvas) {
      let imgElement = document.createElement('img');
      imgElement.src = URL.createObjectURL(image);
      imgElement.onload = () => {
        const img = new FabricImage(imgElement, {
          scaleX: canvas.width / imgElement.width,
          scaleY: canvas.width / imgElement.width,
          selectable: false,
          evented: false
        });

        if (imgElement.width > canvas.width) {
          img.scaleToWidth(canvas.width);
        }

        canvas.add(img);
        canvas.centerObject(img);
      }
    }
  }, [image]);

  function addPolygon() {
    if (canvas) {
      const points = [
        { x: 50, y: 0 },
        { x: 100, y: 38 },
        { x: 81, y: 100 },
        { x: 19, y: 100 },
        { x: 0, y: 38 }
      ]

      const poly = new Polygon(points, {
        width: 200,
        fill: currentClass ? currentClass.color : 'rgba(55, 155, 255, 0.5)',
        scaleX: 5,
        scaleY: 5
      });
      canvas.add(poly);
      canvas.centerObject(poly);
      saveHistory();

      let editing = false;
      poly.on('mousedblclick', () => {
        editing = !editing;
        if (editing) {
          poly.cornerStyle = 'circle';
          poly.cornerColor = 'rgba(0,0,255,0.5)';
          poly.hasBorders = false;
          poly.controls = controlsUtils.createPolyControls(poly);
        } else {
          poly.cornerColor = 'blue';
          poly.cornerStyle = 'rect';
          poly.hasBorders = true;
          poly.controls = controlsUtils.createObjectDefaultControls();
        }
        poly.setCoords();
        canvas.requestRenderAll();
      });
    }
  }

  function selectionMode() {
    if (canvas) {
      canvas.isDrawingMode = false;
    }
  }

  function brushMode() {
    if (canvas) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = currentClass ? currentClass.color : 'black';
      saveHistory();
    }
  }

  function eraserMode() {
    if (canvas) {
      const selected = canvas.getActiveObject();
      selected ? canvas.remove(selected) : toast("No selection to delete");
    }
  }

  useEffect(() => {
    brushMode();
  }, [brushWidth])

  return (
    <>
      <div className=''>
        <h1 className='text-3xl text-white'>Hello!</h1>
        <p className='text-white text-lg'>Upload your image to get started.</p>

        <div className='mt-4'>
          <Input className='text-white border-white w-full md:w-[400px] mx-auto' type='file'
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
        </div>

        <div className='preview relative mt-4 overflow-scroll md:overflow-visible md:pb-20'>
          <div className='tools hidden md:flex absolute top-4 left-[-52px] flex-col gap-2 p-2 bg-gray-300 rounded'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="default" className={`${tool == "move" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                    size="icon" onClick={() => { selectionMode(); setTool('move') }}>
                    <Move />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Selection mode</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="default" className={`${tool == "brush" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                    size="icon" onClick={() => { brushMode(); setTool('brush') }}>
                    <Brush />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Brush annotation</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="default" className={`${tool == "polygon" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                    size="icon" onClick={() => { addPolygon(); setTool('polygon') }}>
                    <SquareDashed />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Polygon annotation</span>
                </TooltipContent>
              </Tooltip>

              <Separator className='my-1 bg-black' />

              <Tooltip>
                <TooltipTrigger>
                  <Button variant="default" className={`${tool == "eraser" ? 'bg-sky-600' : 'bg-zinc-600'} text-white`}
                    size="icon" onClick={() => { eraserMode(); }}>
                    <Eraser />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Eraser</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="default" className='bg-zinc-600 text-white' size="icon"
                    onClick={() => undoLast()}>
                    <Undo />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Undo last edition</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button size="icon" className='bg-transparent' onClick={() => setManageClasses(true)}>
                    <span className='w-4 h-4 rounded-full' style={{ backgroundColor: currentClass?.color }}></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Current class</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className='hidden md:block absolute md:top-[45%] top-4 left-[-108px] gap-2 p-2 bg-gray-300 rounded -rotate-90'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Input type="range" className='' value={brushWidth} onChange={(e) => setBrushWidth(+e.target.value)} />
                </TooltipTrigger>
                <TooltipContent>
                  <span className='text-white p-1 rounded bg-black/50 mb-2'>Brush width</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <canvas id="canvas" ref={canvasRef} />
        </div>
        <div className='tools md:hidden flex gap-2 p-2 bg-gray-300 rounded'>
          <Button variant="default" className={`${tool == "move" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
            size="icon" onClick={() => { selectionMode(); setTool('move') }}>
            <Move />
          </Button>
          <Button variant="default" className={`${tool == "brush" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
            size="icon" onClick={() => setTool('brush')}>
            <Brush />
          </Button>
          <Button variant="default" className={`${tool == "polygon" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
            size="icon" onClick={() => { addPolygon(); setTool('polygon') }}>
            <SquareDashed />
          </Button>

          <Separator orientation='vertical' className='my-1 bg-black h-[30px]' />

          <Button variant="default" className={`${tool == "eraser" ? 'bg-sky-600' : 'bg-zinc-600'} text-white`}
            size="icon" onClick={() => { }}>
            <Eraser />
          </Button>
          <Button variant="default" className='bg-zinc-600 text-white' size="icon">
            <Undo />
          </Button>

          <Button size="icon" className='bg-transparent' onClick={() => setManageClasses(true)}>
            <span className='w-4 h-4 rounded-full' style={{ backgroundColor: currentClass?.color }}></span>
          </Button>

          <TooltipProvider>
            <Tooltip open={showBrushWidth} onOpenChange={setShowBrushWidth}>
              <TooltipTrigger>
                <Button size="icon" className='bg-zinc-600 text-white' onClick={() => setShowBrushWidth(!showBrushWidth)}>
                  <PenLine />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Input type="range" className='' value={brushWidth} onChange={(e) => setBrushWidth(+e.target.value)} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Sheet open={manageClasses} onOpenChange={() => setManageClasses(false)}>
        <SheetContent className='bg-white'>
          <SheetHeader>
            <SheetTitle>Manage classes</SheetTitle>
          </SheetHeader>

          <div className='mt-4'>
            <div className='flex gap-4'>
              <div className='flex flex-col basis-full gap-2'>
                <Input className='' placeholder='Class name' value={newClass.label} onChange={(e) => setNewClass({ ...newClass, label: e.target.value })} />
                <Input type='color' className='' value={newClass.color} placeholder='Color' onChange={(e) => setNewClass({ ...newClass, color: e.target.value })} />
              </div>
              <Button variant='default' size="icon" className='bg-black text-white' onClick={() =>
                newClass && addClass(newClass)}>
                <PlusCircle />
              </Button>
            </div>

            <div className='mt-4'>
              <ul className='flex flex-col gap-2'>
                {classes.map((item, index) => (
                  <li key={index} className='flex gap-4 items-center'>
                    <span className='w-4 h-4 rounded-full' style={{ backgroundColor: item.color }}></span>
                    <span>{item.label} {currentClass == item && "(current)"}</span>
                    <div className='flex gap-2 ml-auto'>
                      <Button variant='default' className='bg-black text-white' onClick={() => setCurrentClass(item)}>Select</Button>
                      <Button variant='default' size="icon" className='bg-black text-white' onClick={() => removeClass(index)}><Trash /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className='footer fixed bottom-0 left-0 w-full p-2 md:p-4 bg-white shadow-lg'>
        <div className='container mx-auto flex gap-4 items-center'>
          <Button variant='default' className='bg-black text-white' onClick={() => setManageClasses(true)}>Manage classes</Button>
          <Button variant='default' className='bg-black text-white'>Export COCO</Button>
        </div>
      </div>
    </>
  )
}

export default App
