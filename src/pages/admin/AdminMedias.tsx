import { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { LayoutGrid, List, Plus, Search, Trash2, Upload } from 'lucide-react'
import { formatBytes } from '@/utils/converter'

const AdminMedias = observer(() => {
	const { mediaStore } = useStore()
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		mediaStore.fetchImages({ pageIndex: 1, pageSize: 80 })
	}, [mediaStore])

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		const uploads = Array.from(files)
		for (const file of uploads) {
			await mediaStore.uploadImage(file)
		}

		e.target.value = ''
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		mediaStore.fetchImages({ pageIndex: 1, search: searchTerm })
	}

	const totalItems = mediaStore.metaData?.totalItems ?? mediaStore.images.length
	const visibleItems = mediaStore.images.length

	const isLoadMoreDisabled = useMemo(() => {
		if (!mediaStore.metaData) return true
		return mediaStore.metaData.currentPage >= mediaStore.metaData.totalPages
	}, [mediaStore.metaData])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Thư viện ảnh</h1>
					<p className="text-sm text-gray-500 mt-1">Quản lý và tải lên hình ảnh sản phẩm</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={handleUploadClick}
						className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
					>
						<Plus size={18} />
						Thêm tệp mới
					</button>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-4 space-y-4">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setViewMode('grid')}
							className={`p-2 rounded-md border ${
								viewMode === 'grid'
									? 'bg-primary-50 border-primary-200 text-primary-600'
									: 'border-gray-200 text-gray-500 hover:bg-gray-50'
							}`}
						>
							<LayoutGrid size={18} />
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`p-2 rounded-md border ${
								viewMode === 'list'
									? 'bg-primary-50 border-primary-200 text-primary-600'
									: 'border-gray-200 text-gray-500 hover:bg-gray-50'
							}`}
						>
							<List size={18} />
						</button>
					</div>

					<select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
						<option>Tất cả</option>
						<option>Hình ảnh</option>
						<option>Video</option>
					</select>
					<select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
						<option>Tất cả các ngày</option>
						<option>7 ngày qua</option>
						<option>30 ngày qua</option>
					</select>

					<button className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
						Chọn nhiều
					</button>

					<form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
							<input
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Tìm kiếm media..."
								className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64"
							/>
						</div>
						<button
							type="submit"
							className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800"
						>
							Tìm
						</button>
					</form>
				</div>

				{mediaStore.error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
						{mediaStore.error}
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					multiple
					className="hidden"
					onChange={handleFilesSelected}
				/>

				{mediaStore.isLoading && mediaStore.images.length === 0 ? (
					<div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
						<div className="inline-flex items-center gap-2 text-gray-600">
							<Upload size={18} /> Đang tải dữ liệu...
						</div>
					</div>
				) : mediaStore.images.length === 0 ? (
					<div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
						<p className="text-gray-600">Chưa có tệp media nào</p>
					</div>
				) : (
					<div
						className={
							viewMode === 'grid'
								? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
								: 'space-y-3'
						}
					>
						{mediaStore.images.map((image) => (
							<div
								key={image.id}
								className={
									viewMode === 'grid'
										? 'group relative rounded-lg border border-gray-200 bg-white overflow-hidden'
										: 'flex items-center gap-4 border border-gray-200 rounded-lg p-3 bg-white'
								}
							>
								<img
									src={image.url}
									alt={image.altText || image.fileName}
									className={
										viewMode === 'grid'
											? 'h-32 w-full object-cover'
											: 'h-16 w-16 rounded-md object-cover'
									}
								/>

								{viewMode === 'grid' && (
									<div className="p-3">
										<p className="text-xs text-gray-700 truncate">{image.fileName}</p>
                                        <p className="text-xs text-gray-500 truncate">Kích thước: {formatBytes(image.fileSize)}</p>
                                        <p className='text-xs text-gray-500 truncate'>Cỡ ảnh: {image.width} x {image.height}</p>
									</div>
								)}

								{viewMode === 'list' && (
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-900">{image.fileName}</p>
										<p className="text-xs text-gray-500 truncate">{image.url}</p>
									</div>
								)}

								<button
									onClick={() => mediaStore.deleteImage(image.id)}
									className={
										viewMode === 'grid'
											? 'absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
											: 'text-red-600 p-2 rounded-md hover:bg-red-50'
									}
									title="Xoa"
								>
									<Trash2 size={16} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="text-center text-sm text-gray-600">
				Đang hiển thị {visibleItems} của {totalItems} file media
			</div>

			<div className="flex items-center justify-center">
				<button
					onClick={() => mediaStore.loadMore()}
					disabled={isLoadMoreDisabled || mediaStore.isLoading}
					className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Tải thêm
				</button>
			</div>
		</div>
	)
})

export default AdminMedias
