on run argv
	if (count of argv) is less than 2 then
		error "Usage: osascript reexport_xlsx_numbers.applescript <input_xlsx> <output_xlsx>"
	end if

	set inPath to item 1 of argv
	set outPath to item 2 of argv

	set inFile to POSIX file inPath
	set outFile to POSIX file outPath

	tell application "Numbers"
		activate
		set openResult to open inFile
		-- open pode retornar um document, uma lista de documents, ou missing value
		set docRef to missing value
		try
			if class of openResult is document then
				set docRef to openResult
			else if class of openResult is list then
				if (count of openResult) > 0 then set docRef to item 1 of openResult
			end if
		end try
		if docRef is missing value then
			error "Numbers não conseguiu abrir o arquivo (docRef = missing value). Verifique permissões de automação e se o arquivo abre manualmente no Numbers."
		end if
		-- Give Numbers a moment to fully load the document
		delay 3
		try
			-- Re-export as Excel to force a clean XLSX package
			export docRef to outFile as Microsoft Excel
		on error errMsg number errNum
			try
				close docRef saving no
			end try
			error errMsg number errNum
		end try
		try
			close docRef saving no
		end try
	end tell
end run
