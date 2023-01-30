export const formatSize = (size: number) => {
    if (size < 1024) {
        return size.toFixed(2) + 'B'
    }
    if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + 'KB'
    }
    if (size < 1024 * 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + 'MB'
    }
    if (size < 1024 * 1024 * 1024 * 1024) {
        return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
    }
    return (size / 1024 / 1024 / 1024 / 1024).toFixed(2) + 'TB'
}
