import { useEffect, useRef, useState } from 'react'
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
} from '@microsoft/signalr'

export interface NewOrderNotification {
    message?: string
    [key: string]: unknown
}

export interface UseSignalROptions {
    hubUrl?: string
    enabled?: boolean
    showBrowserAlert?: boolean
    onReceiveNewOrder?: (orderData: NewOrderNotification) => void
}

const getDefaultHubUrl = (): string => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
    if (!apiBaseUrl) return 'https://localhost:7228/hubs/admin-notifications'

    // VITE_API_BASE_URL thường là .../api, còn SignalR hub nằm ngoài /api
    return `${apiBaseUrl.replace(/\/api\/?$/, '')}/hubs/admin-notifications`
}

const useSignalR = (options: UseSignalROptions = {}) => {
    const {
        hubUrl = getDefaultHubUrl(),
        enabled = true,
        showBrowserAlert = false,
        onReceiveNewOrder,
    } = options

    const connectionRef = useRef<HubConnection | null>(null)
    const onReceiveNewOrderRef = useRef<UseSignalROptions['onReceiveNewOrder']>(onReceiveNewOrder)

    const [connectionState, setConnectionState] = useState<HubConnectionState>(
        HubConnectionState.Disconnected
    )
    const [lastOrder, setLastOrder] = useState<NewOrderNotification | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        onReceiveNewOrderRef.current = onReceiveNewOrder
    }, [onReceiveNewOrder])

    useEffect(() => {
        if (!enabled) return

        let isUnmounted = false

        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => localStorage.getItem('token') || '',
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build()

        connectionRef.current = connection
        setConnectionState(connection.state)

        connection.on('ReceiveNewOrder', (orderData: NewOrderNotification) => {
            if (isUnmounted) return
            setLastOrder(orderData)
            onReceiveNewOrderRef.current?.(orderData)

            if (showBrowserAlert && orderData?.message) {
                alert(String(orderData.message))
            }
        })

        connection.onreconnecting(() => {
            if (!isUnmounted) setConnectionState(HubConnectionState.Reconnecting)
        })

        connection.onreconnected(() => {
            if (!isUnmounted) setConnectionState(HubConnectionState.Connected)
        })

        connection.onclose(() => {
            if (!isUnmounted) setConnectionState(HubConnectionState.Disconnected)
        })

        const startConnection = async () => {
            try {
                setError(null)
                await connection.start()
                if (!isUnmounted) {
                    setConnectionState(HubConnectionState.Connected)
                }
            } catch (startError) {
                if (!isUnmounted) {
                    setError(startError instanceof Error ? startError.message : 'SignalR connection failed')
                    setConnectionState(HubConnectionState.Disconnected)
                }
            }
        }

        void startConnection()

        return () => {
            isUnmounted = true
            connection.off('ReceiveNewOrder')
            void connection.stop()
            connectionRef.current = null
        }
    }, [enabled, hubUrl, showBrowserAlert])

    return {
        connection: connectionRef.current,
        connectionState,
        isConnected: connectionState === HubConnectionState.Connected,
        lastOrder,
        error,
    }
}

export default useSignalR