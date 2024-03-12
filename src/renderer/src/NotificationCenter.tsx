import { Toast, ToastBody, ToastContainer, ToastContainerProps, ToastHeader } from 'react-bootstrap'
import { createContext, forwardRef, FunctionComponent, JSX, RefObject, useImperativeHandle, useState } from 'react'
import * as React from 'react'
import { IconProps } from 'react-bootstrap-icons'

export const NotificationContext: React.Context<RefObject<NotificationService> | null> = createContext(
  null as RefObject<NotificationService> | null
)

export interface Notification {
  id?: number
  header: string
  message: string
  icon?: FunctionComponent<IconProps>
}

export interface NotificationService {
  addNotification(notification: Notification): void
}

export const NotificationCenter = forwardRef<NotificationService, ToastContainerProps>(
  function NotificationCenterImplementation(props: ToastContainerProps, ref): JSX.Element {
    const [notifications, setNotifications] = useState([] as Notification[])

    useImperativeHandle(
      ref,
      () => ({
        addNotification(notification: Notification): void {
          notification.id = notification.id ?? new Date().getTime() + Math.random()
          console.log(notifications)
          setNotifications(notifications.concat([notification]))
        }
      }),
      [notifications]
    )

    function removeNotification(id): void {
      setNotifications(notifications.filter((notification) => notification.id !== id))
    }

    return (
      <ToastContainer {...props} position={'top-center'} className="position-fixed mt-2">
        {notifications.map((notification) => {
          return (
            <Toast
              key={notification.id}
              onClose={() => removeNotification(notification.id)}
              autohide={true}
              delay={3000}
            >
              <ToastHeader className={'justify-content-between'}>
                <span>
                  {notification.icon && React.createElement(notification.icon, { size: 25 })}
                  {notification.header}
                </span>
              </ToastHeader>
              <ToastBody>
                <small>
                  {notification.message.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </small>
              </ToastBody>
            </Toast>
          )
        })}
      </ToastContainer>
    )
  }
)
