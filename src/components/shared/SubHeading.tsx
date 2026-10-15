/** The small uppercase heading over a block inside a detail card. */
const SubHeading = ({ id, children }: { id?: string; children: string }) => (
  <h3 id={id} className='text-xs font-semibold tracking-[0.06em] text-textMuted uppercase'>
    {children}
  </h3>
)

export default SubHeading
