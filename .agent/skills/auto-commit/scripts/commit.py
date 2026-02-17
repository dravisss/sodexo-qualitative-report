import subprocess
import sys
import datetime

def run_command(command):
    try:
        result = subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{' '.join(command)}': {e.stderr}")
        sys.exit(1)

def main():
    # check if there are changes
    status = run_command(["git", "status", "--porcelain"])
    
    if not status:
        print("No changes to commit.")
        return

    # Add all changes
    run_command(["git", "add", "."])

    # Determine commit message
    if len(sys.argv) > 1:
        message = sys.argv[1]
    else:
        print("Error: Commit message is required.")
        sys.exit(1)

    # Commit
    run_command(["git", "commit", "-m", message])
    print(f"Committed with message: '{message}'")

if __name__ == "__main__":
    main()
