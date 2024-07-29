export type TAttendeeFilterRequest = {
  name?: string | undefined
  email?: string | undefined
  gender?: 'MALE' | 'FEMALE' | 'OTHERS'
  searchTerm?: string | undefined
}
