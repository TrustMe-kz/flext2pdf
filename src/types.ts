import { Flext } from '@trustme24/flext';


// Base Data Types

export type Obj<T = any> = Record<string, T>;

export type PDF = Buffer;


// Base Struct Types

export type Flext2Pdf = {
    get: Flext2PdfHandler,
    fromFlext: Flext2PdfHandler,
    fromFlextTemplate: FlextTemplate2PdfHandler,
    clear: Flext2PdfClearHandler,
};


// Base Callable Types

export type Flext2PdfHandler = (val: Flext | string, options: any) => Promise<PDF>;

export type FlextTemplate2PdfHandler = (val: string, options: any) => Promise<PDF>;

export type Flext2PdfClearHandler = () => Promise<void>;
