import { useEffect, useState } from 'react';
import './App.css'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button';
import { Brush, Eraser, Pencil, PlusCircle, SquareDashed, Trash, Undo, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Separator } from './components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet';
import { toast } from 'sonner';

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [tool, setTool] = useState<'brush' | 'polygon' | 'eraser'>('brush');
  const [manageClasses, setManageClasses] = useState<boolean>(false);
  const [classes, setClasses] = useState<{ label: string; color: string }[]>([]);
  const [newClass, setNewClass] = useState<{ label: string; color: string }>({ label: '', color: '' });
  const [imageZoom, setImageZoom] = useState<number>(1);

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
    console.log(image);
  }, [image])

  return (
    <>
      <div className=''>
        <h1 className='text-3xl text-white'>Hello!</h1>
        <p className='text-white text-lg'>Upload your image to get started.</p>

        <div className='mt-4'>
          <Input className='text-white border-white w-full md:w-[400px] mx-auto' type='file'
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
        </div>

        {image && (
          <>
            <div className='preview relative mt-4 overflow-scroll md:overflow-visible'>
              <div className='tools hidden md:flex absolute top-4 left-[-52px] flex-col gap-2 p-2 bg-gray-300 rounded'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="default" className={`${tool == "brush" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                        size="icon" onClick={() => setTool('brush')}>
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
                        size="icon" onClick={() => setTool('polygon')}>
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
                      <Button variant="default" className={`${tool == "eraser" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                        size="icon" onClick={() => setTool('eraser')}>
                        <Eraser />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className='text-white p-1 rounded bg-black/50 mb-2'>Eraser</span>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="default" className='bg-zinc-600 text-white' size="icon">
                        <Undo />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className='text-white p-1 rounded bg-black/50 mb-2'>Undo last edition</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <img src={URL.createObjectURL(image)} alt="" style={{
                transform: `scale(${imageZoom})`,
              }} />
            </div>
            <div className='tools md:hidden flex gap-2 p-2 bg-gray-300 rounded'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className={`${tool == "brush" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                      size="icon" onClick={() => setTool('brush')}>
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
                      size="icon" onClick={() => setTool('polygon')}>
                      <SquareDashed />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className='text-white p-1 rounded bg-black/50 mb-2'>Polygon annotation</span>
                  </TooltipContent>
                </Tooltip>

                <Separator orientation='vertical' className='my-1 bg-black h-[30px]' />

                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className={`${tool == "eraser" ? 'bg-sky-600' : 'bg-zinc-600'}  text-white`}
                      size="icon" onClick={() => setTool('eraser')}>
                      <Eraser />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className='text-white p-1 rounded bg-black/50 mb-2'>Eraser</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className='bg-zinc-600 text-white' size="icon">
                      <Undo />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className='text-white p-1 rounded bg-black/50 mb-2'>Undo last edition</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation='vertical' className='my-1 bg-black h-[30px]' />

              <Button variant="default" className='bg-zinc-600 text-white' size="icon"
                onClick={() => setImageZoom(imageZoom + 0.1)}>
                <ZoomIn />
              </Button>
              <Button variant="default" className='bg-zinc-600 text-white' size="icon"
                onClick={() => setImageZoom(imageZoom - 0.1)}>
                <ZoomOut />
              </Button>
            </div>
          </>
        )}
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
                    <span>{item.label}</span>
                    <div className='flex gap-2 ml-auto'>
                      <Button variant='default' size="icon" className='bg-black text-white w-6 h-6'><Pencil /></Button>
                      <Button variant='default' size="icon" className='bg-black text-white w-6 h-6' onClick={() => removeClass(index)}><Trash /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className='footer fixed bottom-0 left-0 w-full p-4 bg-white shadow-lg'>
        <div className='container mx-auto flex gap-4 items-center'>
          <Button variant='default' className='bg-black text-white' onClick={() => setManageClasses(true)}>Manage classes</Button>
          <Button variant='default' className='bg-black text-white'>Save annotations</Button>
        </div>
      </div>
    </>
  )
}

export default App
