'use client'

// ponytail: throwaway visual check for Phase 1 of the MUI -> Tailwind
// migration (see plan). Delete this route before Phase 7's final commit.

import { useState } from 'react'

import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'
import Combobox from '@/components/ui/Combobox'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import Input from '@/components/ui/Input'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import Textarea from '@/components/ui/Textarea'

const colors = ['primary', 'secondary', 'error', 'success', 'warning', 'info'] as const

const UiKitPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(3)
  const [tab, setTab] = useState('one')
  const [tags, setTags] = useState<string[]>(['Oud'])

  return (
    <div className='mx-auto flex max-w-4xl flex-col gap-8 bg-backgroundDefault p-8'>
      <section className='flex flex-wrap gap-2'>
        {(['filled', 'outlined', 'text'] as const).map(variant =>
          colors.map(color => (
            <Button key={`${variant}-${color}`} variant={variant} color={color}>
              {color}
            </Button>
          ))
        )}
        <Button loading>Loading</Button>
      </section>

      <section className='flex flex-wrap gap-2'>
        {colors.map(color => (
          <Badge key={color} color={color}>
            {color}
          </Badge>
        ))}
      </section>

      <section className='flex flex-col gap-3'>
        <Alert severity='success'>Saved successfully.</Alert>
        <Alert severity='error' onClose={() => {}}>
          Something went wrong.
        </Alert>
      </section>

      <Card hoverable>
        <CardHeader>Card title</CardHeader>
        <CardBody className='flex flex-col gap-4'>
          <Input label='Name' placeholder='Al Madina' />
          <Select label='Role' placeholder='Choose one' options={[{ label: 'Admin', value: 'admin' }]} />
          <Textarea label='Description' placeholder='...' />
          <Checkbox label='Active' />
          <Combobox
            label='Notes'
            freeSolo
            options={[]}
            value={tags}
            onChange={next => setTags(next as string[])}
            placeholder='Type and press enter'
          />
        </CardBody>
        <CardFooter>
          <Button variant='text'>Cancel</Button>
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        </CardFooter>
      </Card>

      <Dropdown trigger={<Button variant='outlined'>Actions</Button>}>
        <DropdownItem icon={<i className='tabler-edit' />}>Edit</DropdownItem>
        <DropdownItem danger icon={<i className='tabler-trash' />}>
          Delete
        </DropdownItem>
      </Dropdown>

      <Tabs items={[{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }]} value={tab} onChange={setTab} />
      <TabPanel active={tab === 'one'}>Tab one content</TabPanel>
      <TabPanel active={tab === 'two'}>Tab two content</TabPanel>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell align='right'>Price</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover>
            <TableCell>Oud Royale</TableCell>
            <TableCell align='right'>450 AED</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Pagination page={page} count={10} onChange={setPage} />

      <Spinner />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader onClose={() => setModalOpen(false)}>Confirm</ModalHeader>
        <ModalBody>Are you sure?</ModalBody>
        <ModalFooter>
          <Button variant='text' onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button color='error' onClick={() => setModalOpen(false)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default UiKitPage
