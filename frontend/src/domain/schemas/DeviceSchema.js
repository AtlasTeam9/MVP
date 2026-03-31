import { z } from 'zod'

// Device fields controls used in the form
const deviceSchema = z.object({
    name: z.string().min(1, 'Name is required').max(30, 'Name is too long'),
    operatingSystem: z.string().min(1, 'OS is required').max(30, 'OS is too long'),
    firmwareVersion: z
        .string()
        .min(1, 'Firmware version is required')
        .max(15, 'Firmware version is too long'),
    functionalities: z.string().min(1, 'Functionalities are required'),
    assets: z.array(z.any()).optional(),
    description: z.string().optional(),
})

export { deviceSchema }
