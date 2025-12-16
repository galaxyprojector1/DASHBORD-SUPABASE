"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function DataPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Example: Replace 'your_table_name' with your actual table name
        const { data: result, error: fetchError } = await supabase
          .from('your_table_name')
          .select('*')
          .limit(10)

        if (fetchError) throw fetchError
        setData(result || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Database Data</h2>
        <p className="text-muted-foreground">
          View and manage your Supabase data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>
            Showing latest records from your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-8">
              <Badge variant="destructive" className="mb-2">Error</Badge>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Make sure to:
                <br />
                1. Configure your .env.local file with Supabase credentials
                <br />
                2. Replace 'your_table_name' with your actual table name in the code
                <br />
                3. Ensure your table has the correct RLS policies
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((value: any, cellIdx) => (
                      <TableCell key={cellIdx}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
