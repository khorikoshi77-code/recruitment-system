export interface ApplicantField {
  id: string
  field_key: string
  field_name: string
  field_type: string
  is_required: boolean
  is_displayed: boolean
  display_order: number
  options: string[]
}
