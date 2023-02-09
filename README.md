# Thunderbird Backup

- Double click will work with all parameters set to defaults.
- Command line has two optional flags.
- config is in `config.json` in the same directory as the executable.

### CMD

`./thunderbird_backup.exe [flag]`

- `--quiet`: Will disable Prompt for key to close window.
- `--silent`: Implements `--quiet` and silences all logs.
- `--config path/to/file`: To pass absolute path to config file, or relative path from the executable directory.

### Config file

JSON object saved as `config.json` in the same directory:

```
{
  "sourceDirectories":[".\\testdata"],
  "exportDirectory":".\\exports"
}
```

- `sourceDirectories`: Array of source path strings where the utility is looking for `.msf` files and their accompanying `mbox` files without extension. 
- `exportDirectory`: Destination path string.


> All paths can be absolute or relative.  \
> Relative paths are resolved from the directory where the executable is located.

> Relative paths support unix syntax.  \
> Absolute paths must be in windows syntax with the forward slash escaped.

### Behavior

1. Looks for a `lock_file` in  `exportDirectory`. Aborts if found.
2. Creates a `lock_file`.
3. Loads `known_mails` and `known_mail_locations` from `exportDirectory`.
4. Lists all existing `sourceDirectories`.
5. Creates an export subdirectory in `exportDirectory` for each `sourceDirectories`.
6. Recursively seeks `.msf` files in all `sourceDirectories` as they accompany `mbox` files.
7. Splits `mbox`es into `.eml` files and saves to `exportDirectory`.
   File name template: "YYYY-MM-DD_sanitized_utf_8_subject_first_line_lt_99_chars.eml".
   "_xxxx" is appended to the name if there are duplicates.
8. Updates `known_mails` and `known_mail_locations`.
9. Known emails are skipped if at the same location, or moved if in a new location.

### Destinations

- Works with other letter drives.
  Example: `"D:\\mails"`
- Works with mounted samba network drives.
  Example: `"\\\\10.0.0.1\\Shared Folder\\Mails"`;

### Possibe issues

The decoding logic is weak, only really works for uft-8, ISO-8859-1, Latin1 and others supported by Iconv.

### License

MIT