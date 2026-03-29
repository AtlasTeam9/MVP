import { z } from 'zod'

// Device fields controls used in the form
const deviceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    operatingSystem: z.string().min(1, 'OS is required').max(50, 'Too long'),
    firmwareVersion: z.string().min(1, 'Firmware version is required'),
    functionalities: z.string().min(1, 'Functionalities are required'),
    assets: z.array(z.any()).optional(),
    description: z.string().optional(),
})

export { deviceSchema }
