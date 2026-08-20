'use client'

import { useId } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as RadioGroup from '@radix-ui/react-radio-group'
import * as Label from '@radix-ui/react-label'
import { Check } from 'lucide-react'

type BaseProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
}

function FieldShell({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: BaseProps & { htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <Label.Root className="field__label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="field__required" aria-hidden>
            *
          </span>
        ) : null}
      </Label.Root>
      {hint ? <p className="field__hint">{hint}</p> : null}
      {children}
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  ...base
}: BaseProps & {
  name: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  const id = useId()
  return (
    <FieldShell {...base} htmlFor={id}>
      <input
        id={id}
        name={name}
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(base.error)}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  )
}

export function TextArea({
  name,
  value,
  onChange,
  placeholder,
  ...base
}: BaseProps & {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <FieldShell {...base} htmlFor={id}>
      <textarea
        id={id}
        name={name}
        className="textarea"
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(base.error)}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  )
}

/**
 * Grupo de casillas. Notifica `(opción, marcada)` en lugar del arreglo
 * completo: si el padre construyera el arreglo nuevo a partir de la prop
 * `values`, dos clics en el mismo ciclo de render partirían del mismo estado
 * viejo y el segundo pisaría al primero.
 */
export type Opcion = { value: string; label: string }

/** Acepta `['Texto']` o `[{ value: 'CODIGO', label: 'Texto' }]`. */
function normalizar(options: readonly (string | Opcion)[]): Opcion[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

export function CheckboxGroup({
  options,
  values,
  onToggle,
  ...base
}: BaseProps & {
  options: readonly (string | Opcion)[]
  values: string[]
  /** Recibe el `value` de la opción, nunca la etiqueta visible. */
  onToggle: (value: string, checked: boolean) => void
}) {
  const groupId = useId()
  const opciones = normalizar(options)

  return (
    <FieldShell {...base}>
      <div className="option-list" role="group" aria-label={base.label}>
        {opciones.map((option, index) => {
          const id = `${groupId}-${index}`
          return (
            <div className="option" key={option.value}>
              <Checkbox.Root
                id={id}
                className="checkbox-root"
                checked={values.includes(option.value)}
                onCheckedChange={(checked) => onToggle(option.value, checked === true)}
              >
                <Checkbox.Indicator className="checkbox-root__indicator">
                  <Check size={13} strokeWidth={3} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <Label.Root className="option__label" htmlFor={id}>
                {option.label}
              </Label.Root>
            </div>
          )
        })}
      </div>
    </FieldShell>
  )
}

export function RadioField({
  options,
  value,
  onChange,
  ...base
}: BaseProps & {
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  const groupId = useId()

  return (
    <FieldShell {...base}>
      <RadioGroup.Root
        className="option-list"
        value={value}
        onValueChange={onChange}
        aria-label={base.label}
      >
        {options.map((option, index) => {
          const id = `${groupId}-${index}`
          return (
            <div className="option" key={option.value}>
              <RadioGroup.Item id={id} className="radio-root" value={option.value}>
                <RadioGroup.Indicator className="radio-root__indicator" />
              </RadioGroup.Item>
              <Label.Root className="option__label" htmlFor={id}>
                {option.label}
              </Label.Root>
            </div>
          )
        })}
      </RadioGroup.Root>
    </FieldShell>
  )
}

export function ConsentField({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  error?: string
}) {
  const id = useId()
  return (
    <div className="field">
      <div className="option" style={{ paddingLeft: 0 }}>
        <Checkbox.Root
          id={id}
          className="checkbox-root"
          checked={checked}
          onCheckedChange={(next) => onChange(next === true)}
        >
          <Checkbox.Indicator className="checkbox-root__indicator">
            <Check size={13} strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <Label.Root className="option__label" htmlFor={id}>
          {label}
        </Label.Root>
      </div>
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Agrupa preguntas bajo un título. Trece campos en una sola columna son un muro;
 * en tres bloques con nombre se leen como tres pasos cortos.
 */
export function Bloque({
  numero,
  titulo,
  descripcion,
  children,
}: {
  numero: number
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="bloque">
      <legend className="bloque__titulo">
        <span className="bloque__numero">{numero}</span>
        {titulo}
      </legend>
      {descripcion ? <p className="bloque__desc">{descripcion}</p> : null}
      <div className="bloque__campos">{children}</div>
    </fieldset>
  )
}
