import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { createRef, JSX, RefObject, useEffect, useState } from 'react'
import Editor from './Editor'
import Index from './Index'
import { FiletypeJson, Floppy } from 'react-bootstrap-icons'

//@ts-ignore correct type
const styles: Record<string, () => Promise<{ default: string }>> = import.meta.glob('./assets/theme-*.scss', {
  query: '?inline'
})

const styleElemt = document.createElement('style')
document.head.appendChild(styleElemt)

async function loadStyle(name): Promise<void> {
  console.log("LOADING")
  const { default: style } = await styles[`./assets/theme-${name}.scss`]()
  styleElemt.textContent = style
  console.log("LOADED")
}

function App(): JSX.Element {
  const formRef: RefObject<HTMLFormElement> = createRef()
  const [theme, setTheme] = useState('dark')

  function openFile(): void {
    window.api.openConfig()
  }

  function save(): void {
    formRef.current?.requestSubmit()
  }

  useEffect(() => {
    window.api.getTheme().then((theme) => {
      setTheme(theme)
      loadStyle(theme)
    })
    return window.api.onThemeChange((theme) => {
      document.body.setAttribute('data-bs-theme', theme)
      setTheme(theme)
    })
  }, [])

  useEffect(() => {
    return window.api.onBootThemeChange((theme) => {
      loadStyle(theme)
    })
  }, [])

  return (
    <>
      <Navbar className={'bg-body-secondary shadow'} variant={theme}>
        <Container fluid={true}>
          <Navbar.Brand className="d-flex align-items-center justify-content-start py-0 opacity-75">
            <svg version="1.1" viewBox="20 125 250 355" width="90" height="120" id="logo" className="logo">
              <path
                d="m182.45 256.86c14.263-16.933 21.802-18.486 32.265-20.444 2.0796-1.9171 2.0076-10.413 2.0076-10.413s2.952 2.6786 3.5984 7.7563c2.4854 1.0146 7.0519 0.59141 9.6772 0.0306 5.4684-1.1681 4.1288-5.4184 15.2-6.847 14.73-1.6572 30.274 9.9473 30.523 17.186 1.7857 7.1429 14.547-13.234 14.904-23.949 2.8892-13.758 2.7273-71.137-5.074-77.88 9.0702 10.14 8.6419 14.908 11.807 32.94 4.3365-3.7088 4.4822-4.9455 5.1696-16.472 3.63 5.2359-2.3555 48.31 6.4898 40.897 0.0972 12.978-8.6534 27.161 0.35715 24.32-1.4291 13.936-7.622 12.873 0.43111 10.963 1.6033 7.8856-18.964 16.144-1.5944 14.556 0 0-12.413 13.137-16.163 15.101-9.3643 6.2572 4.3433 11.992 4.3433 11.992s-19.282 13.461-25.166 19.803c-5.8843 6.3415 3.9947 29.491-9.6608 14.421-2.6244 7.7461-1.5267 5.4692-2.2004 16.834-2.6618-4.2181-8.7786 6.294-10.913 5.4464 0 0 1.6879-4.5376-1.3763-14.333-3.0642 1.9479-9.9694 15.148-9.9694 15.148s-1.5406-10.95-8.7045-4.8416c-10.253 8.9911-25.368 23.465-28.761 39.715-3.3929 16.25-0.4212 32.532 10.759 50.873s35.106 35.838 79.399 40.695c-53.791-1.6167-98.826-36.142-101.29-82.796-0.77609-20.576 2.0361-30.126 15.061-45.021 13.31-15.22-9.1993-4.6029-17.264-5.4186 2.2656-3.1665 5.076-2.7752 7.4826-5.9857-11.67-2.4635-26.606 1.532-26.606 1.532s0.71782-3.5326 1.2147-6.1619c-3.572-1.4841-24.951-1.545-31.431-3.5815 7.7683-0.79449 8.9275-0.40023 15.42-2.5398-14.714-4.4549-23.024-6.1546-33.102-12.22-5.8511-3.5214-15.268-13.661-15.268-13.661s16.949 11.68 26.786 13.036c21.357 2.9425 45.323 4.4497 68.089 1.3493s40.262-14.964 48.661-26.071 11.815-17.137 6.6071-27.63c-5.2082-10.493-14.315-5.6039-19.231-0.91825-3.761 3.5852-9.3586 7.521-9.468 15.219-2.2041-5.6821-8.6442-4.3253-13.199-3.834-7.3184 0.78925-15.047 5.1667-19.405 10.539-1.2054-3.7429 0.80898-5.3445-3.3817-7.8624-0.84148-0.50559-7.6564-0.72106-7.024-1.4719z"
                fill="currentColor"
              ></path>
              <path
                d="m213.03 245.07s-3.8006 0.64816-6.1707-0.0984c1.8254-1.1147 5.4761-3.344 5.4761-3.344s-1.6009 1.5529-1.2019 2.4271c0.24755 0.54247 1.8965 1.0154 1.8965 1.0154z"
                fill="#f00"
              ></path>
            </svg>
            <h5 className={'d-inline-flex align-items-center align-content-center text-center mx-0 my-0 mt-1'}>
              Edytor
              <br />
              &nbsp;konfiguracji
            </h5>
          </Navbar.Brand>
          <Nav className={'gap-3 me-2'}>
            <Button className={'shadow'} onClick={() => openFile()}>
              <FiletypeJson className={'me-1'} /> Otwórz
            </Button>
            <Button className={'shadow'} onClick={() => save()}>
              <Floppy className={'me-1'} /> Zapisz
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Container fluid={true} className={'d-flex config-container g-0 gap-1'}>
        <Index />
        <div className={'config p-4 border-start border-secondary-subtle shadow-sm'}>
          <Editor formRef={formRef} />
        </div>
      </Container>
    </>
  )
}

export default App
