import { Badge } from './ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

const registers = [
  {
    id: '9c363158b21f4fcfa9402fe6c2bc7531',
    readSuccess: true,
    mode: 'R',
    descriptionPt: 'Status do alarme de ruptura da membrana ',
    descriptionEn: '',
    valuePt: '123',
    valueEn: '123',
    unitPt: '',
    unitEn: '',
    outOfLimit: false,
    groupPt: 'Diferencial de temperatura do comutador',
    groupEn: '',
  },
  {
    id: '9c363158b21f4fcfa9402fe6c2bc7531',
    readSuccess: true,
    mode: 'R',
    descriptionPt: 'Status do alarme de ruptura da membrana ',
    descriptionEn: '',
    valuePt: '123',
    valueEn: '123',
    unitPt: '',
    unitEn: '',
    outOfLimit: false,
    groupPt: 'Diferencial de temperatura do comutador',
    groupEn: '',
  },
]

export default function ReadingsTable() {
  return (
    <div>
      <div className="bg-card overflow-hidden rounded-md border border-muted-foreground">
        <Table>
          <TableHeader className="">
            <TableRow className="bg-muted/50 hover:bg-transparent">
              <TableHead className="h-9 py-2" />
              <TableHead className="h-9 py-2">Descrição</TableHead>
              <TableHead className="h-9 py-2">Grupo</TableHead>
              <TableHead className="h-9 py-2">Valor</TableHead>
              <TableHead className="h-9 py-2">Unidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.map(register => (
              <TableRow key={register.id}>
                <TableCell className="py-2 font-medium">
                  <div
                    className={`size-2 rounded-full ${register.readSuccess ? 'bg-primary' : 'bg-destructive'}`}
                  />
                </TableCell>
                <TableCell className="py-2 font-medium">
                  {register.descriptionPt}
                </TableCell>
                <TableCell className="py-2 font-medium">
                  <Badge
                    variant="secondary"
                    className="bg-foreground/50 text-background"
                  >
                    {register.groupPt}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">{register.valuePt}</TableCell>
                <TableCell className="py-2">{register.unitPt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
