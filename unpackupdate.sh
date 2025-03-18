#!/bin/bash

# Initialize variables
verbose=false
recursive=false
decompressed_count=0
failed_count=0

# Function to process a file
process_file() {
    local file="$1"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        $verbose && echo "Ignoring $file (not a regular file)"
        ((failed_count++))
        return
    fi
    
    # Get file type using the file command
    file_type=$(file -b "$file")
    
    # Determine decompression method based on file type
    if [[ $file_type == *"gzip compressed"* ]]; then
        $verbose && echo "Unpacking $file..."
        gunzip -f -k "$file" 2>/dev/null
        ((decompressed_count++))
    elif [[ $file_type == *"bzip2 compressed"* ]]; then
        $verbose && echo "Unpacking $file..."
        bunzip2 -f -k "$file" 2>/dev/null
        ((decompressed_count++))
    elif [[ $file_type == *"Zip archive"* ]]; then
        $verbose && echo "Unpacking $file..."
        unzip -o "$file" -d "$(dirname "$file")" 2>/dev/null
        ((decompressed_count++))
    elif [[ $file_type == *"compress'd data"* ]] || [[ $file_type == *"compressed data"* ]]; then
        $verbose && echo "Unpacking $file..."
        # Handle .cmpr extension specially if needed
        if [[ $file == *.cmpr ]]; then
            cp "$file" "${file%.cmpr}.Z" 2>/dev/null
            uncompress -f "${file%.cmpr}.Z" 2>/dev/null
            rm -f "${file%.cmpr}.Z" 2>/dev/null
        else
            uncompress -f "$file" 2>/dev/null
        fi
        ((decompressed_count++))
    else
        $verbose && echo "Ignoring $file"
        ((failed_count++))
    fi
}

# Function to process a directory
process_directory() {
    local dir="$1"
    
    # Check if directory exists
    if [ ! -d "$dir" ]; then
        $verbose && echo "Ignoring $dir (not a directory)"
        ((failed_count++))
        return
    fi
    
    # Process all files in the directory
    for item in "$dir"/*; do
        if [ -f "$item" ]; then
            process_file "$item"
        elif [ -d "$item" ] && $recursive; then
            process_directory "$item"
        fi
    done
}

# Parse command line arguments using getopts
while getopts "rv" opt; do
    case $opt in
        r)
            recursive=true
            ;;
        v)
            verbose=true
            ;;
        \?)
            echo "Usage: unpack [-r] [-v] file [files...]"
            exit 1
            ;;
    esac
done
shift $((OPTIND - 1))

# Check if at least one file/directory is provided
if [ $# -eq 0 ]; then
    echo "Usage: unpack [-r] [-v] file [files...]"
    exit 1
fi

# Process all arguments
for arg in "$@"; do
    if [ -f "$arg" ]; then
        process_file "$arg"
    elif [ -d "$arg" ]; then
        process_directory "$arg"
    else
        $verbose && echo "Ignoring $arg (not found)"
        ((failed_count++))
    fi
done

# Output result
echo "Decompressed $decompressed_count archive(s)"

# Return the number of failures as exit code
exit $failed_count