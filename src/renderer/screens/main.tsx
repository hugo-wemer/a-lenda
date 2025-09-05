import { ConnectionForm } from 'renderer/components/connectionForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export function MainScreen() {
  return (
    <Tabs className="h-screen" defaultValue="connection">
      <TabsList className="text-foreground h-auto gap-2 rounded-none w-screen px-0 py-1 bg-card border-b-1 border-popover justify-start">
        <TabsTrigger
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="connection"
        >
          Conexão
        </TabsTrigger>
        <TabsTrigger
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="readings"
        >
          Leituras
        </TabsTrigger>
      </TabsList>
      <TabsContent value="connection" className="mx-2">
        <div className="h-full flex items-center">
          <ConnectionForm />
        </div>
      </TabsContent>
      <TabsContent value="readings">opa</TabsContent>
    </Tabs>
  )
}
