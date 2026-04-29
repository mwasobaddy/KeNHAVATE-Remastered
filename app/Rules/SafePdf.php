<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Smalot\PdfParser\Parser;

class SafePdf implements Rule
{
    public function passes($attribute, $value): bool
    {
        // First: Basic validation
        if (! str_starts_with($value->getMimeType(), 'application/pdf')) {
            return false;
        }
        if ($value->getSize() > 10 * 1024 * 1024) { // 10MB
            return false;
        }

        // Second: Extract text and scan for shellcodes
        $path = $value->getRealPath();
        $parser = new Parser;
        try {
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();
            if (preg_match('/\x00|eval|exec|shell_exec/', $text)) {
                return false;
            }
        } catch (\Exception $e) {
            return false; // Corrupted
        }

        return true;
    }

    public function message(): string
    {
        return 'The PDF file is invalid, oversized, or contains disallowed content.';
    }
}
