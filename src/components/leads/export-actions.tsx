/**
 * Export Actions Component - CSV and PDF export for leads data
 * Uses papaparse for CSV and jspdf + html2canvas for PDF
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FacebookLead } from "@/types/leads"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { FileDown, FileText, Loader2 } from "lucide-react"
import * as Papa from "papaparse"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ExportActionsProps {
  data: FacebookLead[]
  disabled?: boolean
  tableElementId?: string
}

export function ExportActions({
  data,
  disabled = false,
  tableElementId = "leads-table",
}: ExportActionsProps) {
  const [exportingCsv, setExportingCsv] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  /**
   * Export data to CSV format
   */
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("Aucune donnée à exporter")
      return
    }

    setExportingCsv(true)

    try {
      // Format data for CSV
      const csvData = data.map((lead) => ({
        Date: formatDate(lead.date_collecte),
        Heure: formatTime(lead.date_collecte),
        Compte: lead.compte,
        Nom: lead.nom || "",
        Email: lead.email || "",
        Téléphone: lead.tel || "",
        "Code Postal": lead.code_postal || "",
        Activité: lead.activité,
        Source: lead.source || "",
        "Formulaire ID": lead.formulaire_id || "",
      }))

      // Generate CSV
      const csv = Papa.unparse(csvData, {
        delimiter: ",",
        header: true,
        newline: "\r\n",
      })

      // Create download
      const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;",
      })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
      link.setAttribute("href", url)
      link.setAttribute("download", `leads_export_${timestamp}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("Erreur lors de l'export CSV")
    } finally {
      setExportingCsv(false)
    }
  }

  /**
   * Export visible table to PDF format
   */
  const handleExportPDF = async () => {
    if (data.length === 0) {
      alert("Aucune donnée à exporter")
      return
    }

    setExportingPdf(true)

    try {
      // Find table element
      const tableElement = document.getElementById(tableElementId)
      if (!tableElement) {
        throw new Error("Table element not found")
      }

      // Capture table as canvas
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4")
      let position = 0

      // Add image to PDF (with pagination if needed)
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Download PDF
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
      pdf.save(`leads_export_${timestamp}.pdf`)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Erreur lors de l'export PDF. Assurez-vous que la table est visible.")
    } finally {
      setExportingPdf(false)
    }
  }

  /**
   * Format date to French locale
   */
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  /**
   * Format time from date string
   */
  const formatTime = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: fr })
    } catch {
      return ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* CSV Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={disabled || exportingCsv || data.length === 0}
        className="gap-2"
      >
        {exportingCsv ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Exporter CSV
      </Button>

      {/* PDF Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={disabled || exportingPdf || data.length === 0}
        className="gap-2"
      >
        {exportingPdf ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        Exporter PDF
      </Button>

      {/* Status text */}
      {data.length === 0 && (
        <span className="text-sm text-muted-foreground">
          Aucune donnée à exporter
        </span>
      )}
    </div>
  )
}

/**
 * Alternative PDF Export - Full data table export (not just visible)
 * Creates a custom PDF with all leads data formatted in a table
 */
export function ExportFullPDF({
  data,
  disabled = false,
}: {
  data: FacebookLead[]
  disabled?: boolean
}) {
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    if (data.length === 0) {
      alert("Aucune donnée à exporter")
      return
    }

    setExporting(true)

    try {
      const pdf = new jsPDF("l", "mm", "a4") // Landscape mode
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const lineHeight = 7
      const headerHeight = 15

      // Title
      pdf.setFontSize(16)
      pdf.text("Export des Leads Facebook", margin, margin + 5)
      pdf.setFontSize(10)
      pdf.text(
        `Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`,
        margin,
        margin + 12
      )

      // Table headers
      const headers = [
        "Date",
        "Compte",
        "Nom",
        "Email",
        "Téléphone",
        "Activité",
      ]
      const colWidth = (pageWidth - 2 * margin) / headers.length
      let yPos = margin + headerHeight

      // Draw header row
      pdf.setFillColor(59, 130, 246) // Blue-500
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, lineHeight, "F")
      headers.forEach((header, i) => {
        pdf.text(header, margin + i * colWidth + 2, yPos + 5)
      })
      yPos += lineHeight

      // Draw data rows
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(8)

      data.forEach((lead, index) => {
        // Check if we need a new page
        if (yPos + lineHeight > pageHeight - margin) {
          pdf.addPage()
          yPos = margin

          // Redraw header on new page
          pdf.setFillColor(59, 130, 246)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.rect(margin, yPos, pageWidth - 2 * margin, lineHeight, "F")
          headers.forEach((header, i) => {
            pdf.text(header, margin + i * colWidth + 2, yPos + 5)
          })
          yPos += lineHeight
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(8)
        }

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252) // Gray-50
          pdf.rect(margin, yPos, pageWidth - 2 * margin, lineHeight, "F")
        }

        // Format and truncate data
        const rowData = [
          formatDate(lead.date_collecte),
          lead.compte,
          truncate(lead.nom || "N/A", 20),
          truncate(lead.email || "N/A", 25),
          lead.tel || "N/A",
          lead.activité,
        ]

        rowData.forEach((cell, i) => {
          pdf.text(String(cell), margin + i * colWidth + 2, yPos + 5)
        })

        yPos += lineHeight
      })

      // Footer
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Page ${i} sur ${totalPages} - ${data.length} leads`,
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        )
      }

      // Download
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
      pdf.save(`leads_full_export_${timestamp}.pdf`)
    } catch (error) {
      console.error("Error exporting full PDF:", error)
      alert("Erreur lors de l'export PDF")
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "dd/MM/yy", { locale: fr })
    } catch {
      return "N/A"
    }
  }

  const truncate = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || exporting || data.length === 0}
      className="gap-2"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Export PDF Complet
    </Button>
  )
}
