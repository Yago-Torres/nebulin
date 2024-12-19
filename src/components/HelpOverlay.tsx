import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white">
            Ayuda
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Guía rápida de uso de Nebulin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Ligas</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Las ligas son grupos privados donde puedes crear y participar en predicciones con tus amigos.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Nebulines</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Los nebulines son la moneda virtual de la plataforma. Los puedes usar para hacer predicciones.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Predicciones</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Participa en eventos creando predicciones. Si aciertas, ¡ganarás más nebulines!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 