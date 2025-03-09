import subprocess
import sys
import os
import signal
import time
import threading
import webbrowser

def run_backend():
    """Run the FastAPI backend server."""
    try:
        process = subprocess.Popen(
            [sys.executable, "api.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Print output in real-time
        def print_output(pipe, prefix):
            for line in pipe:
                print(f"{prefix}: {line}", end='')
                
        # Start threads to handle stdout and stderr
        threading.Thread(target=print_output, args=(process.stdout, "Backend stdout")).start()
        threading.Thread(target=print_output, args=(process.stderr, "Backend stderr")).start()
        
        return process
    except Exception as e:
        print(f"Error starting backend: {e}")
        return None

def run_frontend():
    """Run the React frontend development server."""
    try:
        os.chdir("frontend")
        process = subprocess.Popen(
            ["npm", "start"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        os.chdir("..")
        
        # Print output in real-time
        def print_output(pipe, prefix):
            for line in pipe:
                print(f"{prefix}: {line}", end='')
                
        # Start threads to handle stdout and stderr
        threading.Thread(target=print_output, args=(process.stdout, "Frontend stdout")).start()
        threading.Thread(target=print_output, args=(process.stderr, "Frontend stderr")).start()
        
        return process
    except Exception as e:
        print(f"Error starting frontend: {e}")
        return None

def main():
    """Start both servers and handle shutdown."""
    print("Starting backend server...")
    backend_process = run_backend()
    
    print("Starting frontend server...")
    frontend_process = run_frontend()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("Servers stopped.")

if __name__ == "__main__":
    main() 