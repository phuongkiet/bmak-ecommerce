import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { ProductAttributeValueDto } from '@/models/Attribute'
import * as attributeValueApi from '@/agent/api/attributeValueApi'

class AttributeValueStore {
	rootStore: RootStore
	attributeValues: ProductAttributeValueDto[] = []
	valuesByAttributeId: Map<number, ProductAttributeValueDto[]> = new Map()
	isLoading: boolean = false
	error: string | null = null

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore
		makeAutoObservable(this)
	}

	async fetchAttributeValues(attributeId: number, force: boolean = false): Promise<void> {
		if (!force && this.valuesByAttributeId.has(attributeId)) {
			this.attributeValues = this.valuesByAttributeId.get(attributeId) || []
			return
		}

		this.isLoading = true
		this.error = null

		try {
			const data = await attributeValueApi.getAttributeValuesByAttributeId(attributeId)
			runInAction(() => {
				this.attributeValues = data
				this.valuesByAttributeId.set(attributeId, data)
				this.isLoading = false
			})
		} catch (error: any) {
			runInAction(() => {
				this.error = error?.message || 'Không thể tải giá trị thuộc tính'
				this.attributeValues = []
				this.isLoading = false
			})
		}
	}

	getValuesByProductId(productId: number): ProductAttributeValueDto[] {
		return this.attributeValues.filter((x) => x.productId === productId)
	}

	getValuesByAttributeId(attributeId: number): ProductAttributeValueDto[] {
		return this.valuesByAttributeId.get(attributeId) || []
	}

	clearAttributeValues(): void {
		this.attributeValues = []
		this.valuesByAttributeId.clear()
	}
}

export default AttributeValueStore

