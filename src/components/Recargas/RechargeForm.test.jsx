import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RechargeForm } from './RechargeForm'
import { apiService } from '../../services/api'
import { useAuthToken } from '../../hooks/useAuthToken'
import { getSuppliers } from '../../utils/suppliersCache'

// Mocks
vi.mock('../../services/api', () => ({
    apiService: {
        createRecharge: vi.fn(),
    },
}))

vi.mock('../../hooks/useAuthToken', () => ({
    useAuthToken: vi.fn(),
}))

vi.mock('../../utils/suppliersCache', () => ({
    getSuppliers: vi.fn(),
}))

vi.mock('../../utils/transactionsCache', () => ({
    clearTransactionsCache: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

// Mock de Lucide icons para evitar problemas de renderizado
vi.mock('lucide-react', () => ({
    Smartphone: () => <div data-testid="icon-smartphone" />,
    DollarSign: () => <div data-testid="icon-dollar" />,
    Building2: () => <div data-testid="icon-building" />,
    Send: () => <div data-testid="icon-send" />,
    Sparkles: () => <div data-testid="icon-sparkles" />,
}))

describe('RechargeForm', () => {
    const mockOnSuccess = vi.fn()
    const mockSuppliers = [
        { id: '1', name: 'Claro', logo: 'claro.png' },
        { id: '2', name: 'Movistar', logo: 'movistar.png' },
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup default mocks
        useAuthToken.mockReturnValue({ isReady: true })
        getSuppliers.mockResolvedValue(mockSuppliers)
    })

    it('should render the form correctly', async () => {
        render(<RechargeForm onSuccess={mockOnSuccess} />)

        // Esperar a que termine de cargar
        await waitFor(() => {
            expect(screen.getByText('Nueva Recarga')).toBeInTheDocument()
        })

        // Verificar campos
        expect(screen.getByLabelText(/Número de Teléfono/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Monto/i)).toBeInTheDocument()

        // Verificar que carga los proveedores
        expect(screen.getByText('Claro')).toBeInTheDocument()
        expect(screen.getByText('Movistar')).toBeInTheDocument()
    })

    it('should show validation error for invalid phone number', async () => {
        render(<RechargeForm onSuccess={mockOnSuccess} />)

        // Esperar a que cargue
        await waitFor(() => {
            expect(screen.getByText('Nueva Recarga')).toBeInTheDocument()
        })

        const phoneInput = screen.getByLabelText(/Número de Teléfono/i)
        const submitBtn = screen.getByRole('button', { name: /Realizar Recarga Ahora/i })

        // Ingresar número inválido (muy corto)
        fireEvent.change(phoneInput, { target: { value: '300' } })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Número inválido/i)).toBeInTheDocument()
        })
    })

    it('should show validation error for invalid amount', async () => {
        render(<RechargeForm onSuccess={mockOnSuccess} />)

        // Esperar a que cargue
        await waitFor(() => {
            expect(screen.getByText('Nueva Recarga')).toBeInTheDocument()
        })

        const amountInput = screen.getByLabelText(/Monto/i)
        const submitBtn = screen.getByRole('button', { name: /Realizar Recarga Ahora/i })

        // Ingresar monto inválido (menor al mínimo)
        fireEvent.change(amountInput, { target: { value: '500' } })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/El monto mínimo es/i)).toBeInTheDocument()
        })
    })

    it('should submit the form with valid data', async () => {
        apiService.createRecharge.mockResolvedValue({ id: '123', status: 'COMPLETED' })

        render(<RechargeForm onSuccess={mockOnSuccess} />)

        // Esperar a que carguen los proveedores
        await waitFor(() => {
            expect(screen.getByText('Claro')).toBeInTheDocument()
        })

        // Llenar formulario
        fireEvent.change(screen.getByLabelText(/Número de Teléfono/i), { target: { value: '3001234567' } })
        fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '5000' } })

        // Seleccionar proveedor
        fireEvent.click(screen.getByText('Claro'))

        // Enviar
        const submitBtn = screen.getByRole('button', { name: /Realizar Recarga Ahora/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(apiService.createRecharge).toHaveBeenCalledWith({
                phoneNumber: '3001234567',
                amount: 5000,
                supplierId: '1',
            })
            expect(mockOnSuccess).toHaveBeenCalled()
        })
    })

    it('should handle API errors', async () => {
        const error = new Error('Error de API')
        error.response = { data: { message: 'Proveedor no disponible temporalmente' } }
        apiService.createRecharge.mockRejectedValue(error)

        render(<RechargeForm onSuccess={mockOnSuccess} />)

        // Esperar a que carguen los proveedores
        await waitFor(() => {
            expect(screen.getByText('Claro')).toBeInTheDocument()
        })

        // Llenar formulario
        fireEvent.change(screen.getByLabelText(/Número de Teléfono/i), { target: { value: '3001234567' } })
        fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '5000' } })
        fireEvent.click(screen.getByText('Claro'))

        // Enviar
        fireEvent.click(screen.getByRole('button', { name: /Realizar Recarga Ahora/i }))

        await waitFor(() => {
            expect(apiService.createRecharge).toHaveBeenCalled()
            expect(mockOnSuccess).not.toHaveBeenCalled()
        })
    })
})
